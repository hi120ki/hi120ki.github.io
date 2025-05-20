---
sidebar_position: 3
---

# Securing a GitHub App Private Key with KMS

By moving GitHub App private key to Google Cloud KMS, we can benefit from the following:

- Hardware isolation & audit logging – KMS keeps the private key material out of your application runtime and emits Cloud Audit Logs for every cryptographic operation.
- Central rotation & access control – IAM policies such as roles/cloudkms.signer let you grant just‑enough privileges to CI/CD or Cloud Run workloads.
- Compliance – Key import lets you retain ownership of existing RSA keys required by GitHub Apps while meeting regional or BYOK requirements.

## Prerequisites

- GitHub App: Download the PEM‑encoded private key (key.pem) from Settings → Certificates & secrets.
- GCP project: `gcloud config set project <PROJECT_ID>`
- Service account: Grant roles/cloudkms.signer on the CryptoKey (not on the key‑ring) to the workload that will generate JWTs.
- Tools: OpenSSL, gcloud, Terraform, and Go

## 1. Prepare the key for import

Google KMS expects unencrypted PKCS #8 (DER). Convert the GitHub PEM file:

```bash
openssl pkcs8 -topk8 -inform PEM -outform DER \
  -in key.pem -out key.pkcs8 -nocrypt
```

This leaves the private key unencrypted on disk — keep key.pkcs8 in a secure location and delete it after import.

## 2. Create a key‑ring & import job

### 2‑a Key‑ring (idempotent)

```hcl
resource "google_kms_key_ring" "github_keyring" {
  name     = "github-keyring"
  location = "global"
}
```

### 2‑b Import job (wrapping: RSA‑OAEP‑4096 + AES‑256)

```bash
gcloud kms import-jobs create import-key \
  --location=global \
  --keyring=github-keyring \
  --import-method=rsa-oaep-4096-sha256-aes-256 \
  --protection-level=software \
  --project=PROJECT_ID
```

The import job publishes a 4096‑bit RSA OAEP public key, used once to wrap your key material.

## 3. Create the target CryptoKey (Terraform)

```hcl
resource "google_kms_crypto_key" "github_key" {
  name                          = "github-key"
  key_ring                      = google_kms_key_ring.github_keyring.id
  purpose                       = "ASYMMETRIC_SIGN"
  import_only                   = true
  skip_initial_version_creation = true

  version_template {
    algorithm        = "RSA_SIGN_PKCS1_2048_SHA256"
    protection_level = "SOFTWARE"
  }
}
```

## 4. Import the private‑key material

```bash
gcloud kms keys versions import \
  --location=global \
  --keyring=github-keyring \
  --key=github-key \
  --import-job=import-key \
  --algorithm=rsa-sign-pkcs1-2048-sha256 \
  --target-key-file=key.pkcs8 \
  --project=PROJECT_ID
```

The resulting CryptoKeyVersion becomes Primary and is ready for signing.

## 5. Grant signing permissions

```hcl
resource "google_kms_crypto_key_iam_member" "github_key_iam" {
  crypto_key_id = google_kms_crypto_key.github_key.id
  role          = "roles/cloudkms.signer"
  member        = "serviceAccount:svc-github-app@PROJECT_ID.iam.gserviceaccount.com"
}
```

`roles/cloudkms.signer` is sufficient for `projects.locations.keyRings.cryptoKeys.cryptoKeyVersions.asymmetricSign`.

## 6. Generating a GitHub App JWT in Go

Below is a self‑contained example using the official Go KMS client and github.com/golang-jwt/jwt/v5.

```go
package main

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"time"

	kms "cloud.google.com/go/kms/apiv1"
	"github.com/bradleyfalzon/ghinstallation/v2"
	"github.com/google/go-github/v72/github"
	"github.com/kelseyhightower/envconfig"
	"github.com/octo-sts/app/pkg/gcpkms"
)

type Env struct {
	GitHubAppID             int64  `env:"GITHUB_APP_ID"`
	GitHubAppInstallationID int64  `env:"GITHUB_APP_INSTALLATION_ID"`
	GitHubAppKMSKeyPath     string `env:"GITHUB_APP_KMS_KEY_PATH"`
}

func main() {
	ctx := context.Background()

	var env Env
	if err := envconfig.Process("", &env); err != nil {
		log.Fatalf("failed to process env var: %v", err)
	}

	kmsClient, err := kms.NewKeyManagementClient(ctx)
	if err != nil {
		log.Fatalf("failed to create kms client: %v", err)
	}

	signer, err := gcpkms.New(ctx, kmsClient, env.GitHubAppKMSKeyPath)
	if err != nil {
		log.Fatalf("failed to create signer: %v", err)
	}

	atr, err := ghinstallation.NewAppsTransportWithOptions(http.DefaultTransport, env.GitHubAppID, ghinstallation.WithSigner(signer))
	if err != nil {
		log.Fatalf("failed to create gh installation transport: %v", err)
	}

	itr := ghinstallation.NewFromAppsTransport(atr, env.GitHubAppInstallationID)

	client := github.NewClient(&http.Client{Transport: itr, Timeout: 5 * time.Second})

	readme, _, err := client.Repositories.GetReadme(ctx, "organization", "repository", nil)
	if err != nil {
		log.Fatalf("failed to get readme: %v", err)
	}

	fmt.Println(readme.GetContent())
}
```

> The KMS key path format is `projects/PROJECT_ID/locations/LOCATION/keyRings/KEY_RING/cryptoKeys/KEY/cryptoKeyVersions/VERSION`

GitHub responds with an installation token valid for 1 hour. And the installation token will be automatically updated by ghinstallation and go-github in this golang example.

## References

- [Google Cloud KMS – Key import overview](https://cloud.google.com/kms/docs/importing-a-key)
- [Supported wrapping algorithms & AES‑256 envelope](https://cloud.google.com/kms/docs/key-wrapping)
- [KMS AsymmetricSign Go sample](https://cloud.google.com/kms/docs/samples/kms-sign-asymmetric)
- [Creating digital signatures with Cloud KMS](https://cloud.google.com/kms/docs/create-validate-signatures)
- [gcloud kms import-jobs create reference](https://cloud.google.com/sdk/gcloud/reference/kms/import-jobs/create)
- [GitHub Docs – Generating a JWT for a GitHub App, authenticating as an installation](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-json-web-token-jwt-for-a-github-app)
- [bradleyfalzon/ghinstallation](https://github.com/bradleyfalzon/ghinstallation)
- [google/go-github](https://github.com/google/go-github)
- [octo-sts/app](https://github.com/octo-sts/app)
