FROM node:18-bullseye

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        git \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*


# Ensure Encore is available on PATH for interactive and non-interactive shells
ENV PATH="/root/.encore/bin:${PATH}"

# Set working directory
WORKDIR /workspace

# Disable npm prompts
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_AUDIT=false

CMD ["/bin/bash"]
