FROM ubuntu:24.04 AS base

ENV TZ=UTC

# Node.js Variables
ARG NODE_VERSION=20.x

# Update and install necessary packages
RUN apt-get clean && \
    apt-get update -o Acquire::CompressionTypes::Order::=gz && \
    apt-get install -y --fix-missing \
    curl \
    wget \
    build-essential \
    clang \
    llvm \
    pkg-config \
    libssl-dev \
    apt-transport-https \
    ca-certificates \
    gnupg \
    software-properties-common

RUN mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_VERSION nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y nodejs \
    && node --version \
    && npm --version

RUN npm install -g pnpm@latest-10 \
    && pnpm --version

# Install mops
RUN <<EOF
npm i -g ic-mops@1.11.1
mops --version
EOF

USER ubuntu
WORKDIR /home/ubuntu
ENV HOME=/home/ubuntu
RUN mkdir -p /home/ubuntu/bin
ENV PATH=/home/ubuntu/.mops/bin:/home/ubuntu/bin:/home/ubuntu/.local/share/dfx/bin:${PATH}


# Optimized PNPM configuration for better caching
RUN mkdir -p /home/ubuntu/.config/pnpm /home/ubuntu/.local/share/pnpm/store /home/ubuntu/.cache/pnpm
RUN <<EOF
cat > /home/ubuntu/.config/pnpm/rc << 'PNPMRC'
nodeLinker=hoisted
store-dir=/home/ubuntu/.local/share/pnpm/store
cache-dir=/home/ubuntu/.cache/pnpm
prefer-offline=true
PNPMRC
EOF

ENV PNPM_HOME="/home/ubuntu/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install icp-cli - installer puts binary in ~/.cargo/bin
RUN <<EOF
set -e
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/dfinity/icp-cli/releases/download/v0.1.0-beta.3/icp-cli-installer.sh | sh
# Verify installation
ls -la /home/ubuntu/.cargo/bin/
/home/ubuntu/.cargo/bin/icp --version
EOF

# Add icp-cli to PATH for the ubuntu user
ENV PATH="/home/ubuntu/.cargo/bin:${PATH}"

# Install Motoko compiler
RUN <<EOF
set -e
MOTOKO_VERSION=0.16.3-implicits-26
case ${TARGETARCH:-$(uname -m)} in
    amd64|x86_64)
        COMPILER_TARBALL="motoko-Linux-x86_64-${MOTOKO_VERSION}.tar.gz"
        ;;
    arm64|aarch64)
        COMPILER_TARBALL="motoko-Linux-aarch64-${MOTOKO_VERSION}.tar.gz"
        ;;
    *)
        echo "Error: Unsupported architecture" >&2
        exit 1
        ;;
esac
COMPILER_INSTALL_DIR="$HOME/.motoko/moc/$MOTOKO_VERSION/bin"
mkdir -p "$COMPILER_INSTALL_DIR"
COMPILER_RELEASE_URL="https://github.com/caffeinelabs/motoko/releases/download/${MOTOKO_VERSION}/${COMPILER_TARBALL}"
curl -L "$COMPILER_RELEASE_URL" | tar -xz -C "$COMPILER_INSTALL_DIR"
COMPILER_BINARY_DIR=$(find "$COMPILER_INSTALL_DIR" -name "moc" -type f | head -1)
chmod +x "$COMPILER_BINARY_DIR"
EOF

# Install Motoko core library
RUN <<EOF
set -e
CORE_LIB_VERSION=implicits-20
CORE_LIB_INSTALL_DIR="$HOME/.motoko/core/$CORE_LIB_VERSION"
mkdir -p "$CORE_LIB_INSTALL_DIR"
CORE_LIB_URL="https://github.com/caffeinelabs/motoko-core/archive/refs/tags/${CORE_LIB_VERSION}.tar.gz"
SOURCE_SUB_FOLDER="motoko-core-${CORE_LIB_VERSION}/src"
curl -L "$CORE_LIB_URL" | tar -xz --strip-components=2 -C "$CORE_LIB_INSTALL_DIR" "$SOURCE_SUB_FOLDER"
EOF

# Install Motoko base library
RUN <<EOF
set -e
BASE_LIB_VERSION=SKIP
BASE_LIB_INSTALL_DIR="$HOME/.motoko/base/$BASE_LIB_VERSION"
mkdir -p "$BASE_LIB_INSTALL_DIR"
BASE_LIB_URL="https://github.com/caffeinelabs/motoko-base/archive/refs/tags/moc-${BASE_LIB_VERSION}.tar.gz"
SOURCE_SUB_FOLDER="motoko-base-moc-${BASE_LIB_VERSION}/src"
curl -L "$BASE_LIB_URL" | tar -xz --strip-components=2 -C "$BASE_LIB_INSTALL_DIR" "$SOURCE_SUB_FOLDER"
EOF

# Set Motoko environment variables for deploy.sh and other scripts
ENV MOC_PATH="/home/ubuntu/.motoko/moc/0.16.3-implicits-26/bin/moc"
ENV MOTOKO_CORE="/home/ubuntu/.motoko/core/implicits-20"
ENV MOTOKO_BASE="/home/ubuntu/.motoko/base/SKIP"

WORKDIR /workdir

# Copy project files into the image
COPY --chown=ubuntu:ubuntu . /workdir/

RUN chmod +x /workdir/deploy.sh

ENTRYPOINT ["/workdir/deploy.sh"]

