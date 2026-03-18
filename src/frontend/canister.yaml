# yaml-language-server: $schema=https://github.com/dfinity/icp-cli/raw/refs/heads/main/docs/schemas/canister-yaml-schema.json
name: frontend

build:
  steps:
    - type: script
      commands:
        - pnpm install --frozen-lockfile --prefer-offline --child-concurrency 2 --network-concurrency 6
        - node ../../scripts/resize-images.js
        - |
          cat > env.json <<EOF
          {
            "backend_host": "http://localhost:8081",
            "backend_canister_id": "$BACKEND_CANISTER_ID",
            "project_id": "undefined",
            "ii_derivation_origin": "undefined"
          }
          EOF
        - pnpm --filter '@caffeine/template-frontend' build:skip-bindings

    - type: pre-built
      url: https://github.com/dfinity/sdk/raw/refs/tags/0.27.0/src/distributed/assetstorage.wasm.gz
      sha256: 865eb25df5a6d857147e078bb33c727797957247f7af2635846d65c5397b36a6

sync:
  steps:
    - type: assets
      dirs:
        - dist
