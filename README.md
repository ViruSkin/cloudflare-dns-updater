# Cloudflare DNS Updater

A Node.js script to automatically update DNS records on Cloudflare with your current public IP address. This script is perfect for dynamic IP environments, ensuring your domain always points to the correct IP.

## Features

-   Automatically fetches your current public IPv4 and IPv6 addresses.
-   Updates or creates DNS records on Cloudflare with the current IP address.
-   Supports both A and AAAA record types.
-   Option to list all DNS records, show current configuration, or display help.

## Prerequisites

-   Node.js (version 12 or higher)
-   A Cloudflare account with API token
-   A zone ID for the domain you want to manage

## Installation

1. Clone the repository:

```sh
   git clone https://github.com/yourusername/cloudflare-dns-updater.git
```

2. Navigate to the project directory:

```sh
cd cloudflare-dns-updater
```

3. Install the dependencies:

```sh
npm install
```

4. Create a config.json file in the project root with your Cloudflare API token, zone ID, and other necessary configurations. Example:

```json
{
    "CLOUDFLARE_API_TOKEN": "<YOUR_API_TOKEN>",
    "ZONE_ID": "<YOUR_ZONE_ID>",
    "CURRENT_IPV6_URL": "https://api6.ipify.org",
    "CURRENT_IPV4_URL": "https://api.ipify.org",
    "domains": [
        { "DNS_NAME": "test1.example.com", "type": "AAAA" },
        { "DNS_NAME": "test2.example.com", "type": "AAAA", "proxied": true },
        { "DNS_NAME": "test3.example.com", "type": "A" }
    ]
}
```

## Usage

1. Update or create DNS records with the current IP address:

```sh
node dist/index.js
```

2. List all DNS records:

```sh
node dist/index.js --list
```

3. Show the current configuration:

```sh
node dist/index.js --showConfig
```

4. Show help message:

```sh
node dist/index.js --help
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgements

-   Cloudflare for their excellent DNS service and API.

-   Axios for making HTTP requests easy.

-   Readline for handling user input in Node.js.

Feel free to customize this README to better fit your project's needs. If you have any questions or need further assistance, please don't hesitate to ask!
