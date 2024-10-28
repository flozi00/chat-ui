# Chat UI - primeLine fork

This is a fork of the [Hugging Face Chat UI](https://huggingface.co/docs/chat-ui/index) repository.

The main goal of this fork is the internal development during the [primeLine AI](https://primeline-ai.com) project.
This is open source for transparency reasons and keeping the community informed about the progress.
This fork gets updated with the latest changes from the original repository and some of the new features developed during the project are merged back to the original repository if they are considered useful for the community and wanted by the original authors.

## Features added in this fork

- **More research focused**: The websearch is way deeper using multiple search queries and larger context windows for embeddings.
- **Combined search**: The assistans search config can be a combination of specific URLs and domain filters now.
- **Automatic authentication**: Instances deployed behind Cloudflare Access can automatically authenticate users, no need for OpenID Connect anymore.
- **More Tools**: One example of upcoming tools is the native integrated weather tool.