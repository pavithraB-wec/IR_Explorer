# yaml-language-server: $schema=https://github.com/dfinity/icp-cli/raw/refs/heads/main/docs/schemas/canister-yaml-schema.json
name: backend
build:
  steps:
    - type: script
      commands:
        - $MOC_PATH --implicit-package core --default-persistent-actors -no-check-ir -E M0236 -E M0235 -E M0223 -E M0237 --actor-idl system-idl --package base $MOTOKO_BASE --package core $MOTOKO_CORE main.mo -o backend.wasm
        - mv backend.wasm "$ICP_WASM_OUTPUT_PATH"
