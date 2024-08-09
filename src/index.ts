import axios from "axios";
import readline from "readline";
import data from "./config.json";

interface Config {
    CLOUDFLARE_API_TOKEN: string;
    ZONE_ID: string;
    CURRENT_IPV4_URL: string;
    CURRENT_IPV6_URL: string;
    domains: { DNS_NAME: string; type: string; proxied?: boolean }[];
}
const config: Config = data;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const headers = {
    Authorization: `Bearer ${config.CLOUDFLARE_API_TOKEN}`,
    "Content-Type": "application/json",
};

// Function for getting the current IPv4 address
async function getCurrentIPv4(): Promise<string> {
    try {
        const response = await axios.get(config.CURRENT_IPV4_URL);
        return response.data;
    } catch (error) {
        console.error("Error getting current IPv4 address:", error);
        throw error;
    }
}

// Function for getting the current IPv6 address
async function getCurrentIPv6(): Promise<string> {
    try {
        const response = await axios.get(config.CURRENT_IPV6_URL);
        return response.data;
    } catch (error) {
        console.error("Error getting current IPv6 address:", error);
        throw error;
    }
}

async function listRecord(): Promise<void> {
    const url = `https://api.cloudflare.com/client/v4/zones/${config.ZONE_ID}/dns_records`;
    try {
        const response = await axios.get(url, { headers });
        console.log(response.data);
    } catch (error) {
        console.error(`Error listing records:`, error);
        throw error;
    }
}

// Function to create a DNS record in Cloudflare
async function createRecord(
    ip: string,
    dnsName: string,
    type: string,
    proxied = false,
    comment = "Automatically created by Cloudflare API"
): Promise<void> {
    const url = `https://api.cloudflare.com/client/v4/zones/${config.ZONE_ID}/dns_records`;
    const data = {
        content: ip,
        name: dnsName,
        proxied: proxied,
        type: type,
        comment: comment,
        ttl: 1,
    };

    try {
        const response = await axios.post(url, data, { headers });
        if (response.data.success) {
            console.log(`Record successfully created for ${dnsName} with IP ${ip}`);
        } else {
            console.error(`Error creating record for ${dnsName}:`, response.data);
        }
    } catch (error) {
        console.error(`Error creating record for ${dnsName}:`, error);
        throw error;
    }
}

// Function to get the RECORD_ID of the DNS record in Cloudflare
async function getRecordId(dnsName: string, type: string): Promise<string | null> {
    const url = `https://api.cloudflare.com/client/v4/zones/${config.ZONE_ID}/dns_records?type=${type}&name=${dnsName}`;

    try {
        const response = await axios.get(url, { headers });
        const records = response.data.result;
        if (records.length === 0) {
            return null;
        }
        return records[0].id;
    } catch (error) {
        console.error(`Error getting RECORD_ID for ${dnsName}:`, error);
        throw error;
    }
}

// Function to update the IP address in the DNS record in Cloudflare
async function updateCloudflareIP(
    recordId: string,
    dnsName: string,
    ip: string,
    type: string,
    proxied = false
): Promise<void> {
    const url = `https://api.cloudflare.com/client/v4/zones/${config.ZONE_ID}/dns_records/${recordId}`;
    const data = {
        type: type,
        name: dnsName,
        content: ip,
        ttl: 1,
        proxied: proxied,
    };

    try {
        const response = await axios.put(url, data, { headers });
        if (response.data.success) {
            console.log(`IP address successfully updated for ${dnsName} to ${ip}`);
        } else {
            console.error(`Error updating IP address for ${dnsName}:`, response.data);
        }
    } catch (error) {
        console.error(`Error updating IP address for ${dnsName}:`, error);
        throw error;
    }
}

// Main function
async function main() {
    const args = process.argv.slice(2);
    if (args.includes("--list") || args.includes("-l")) {
        await listRecord();
        rl.question("Press Enter to exit...\n", () => {
            rl.close();
        });
        return;
    }

    if (args.includes("--showConfig") || args.includes("-sc")) {
        console.log("Config: ", config);
        rl.question("Press Enter to exit...\n", () => {
            rl.close();
        });
        return;
    }

    if (args.includes("--help") || args.includes("-h")) {
        console.log("Usage:");
        //main command for update or create record
        console.log("Update or create DNS records with the current IP address:");
        console.log("  node dist/index.js ");
        console.log("List all DNS records:");
        console.log("  node dist/index.js --list | -l");
        console.log("Show the current configuration:");
        console.log("  node dist/index.js --showConfig | -sc");
        console.log("Show this help message");
        console.log("  node dist/index.js --help | -h");
        rl.question("Press Enter to exit...\n", () => {
            rl.close();
        });
        return;
    }

    try {
        const currentIPv4 = await getCurrentIPv4();
        const currentIPv6 = await getCurrentIPv6();

        for (const domain of config.domains) {
            const currentIP = domain.type === "A" ? currentIPv4 : currentIPv6;
            const recordIdIP = await getRecordId(domain.DNS_NAME, domain.type);
            if (recordIdIP) {
                await updateCloudflareIP(recordIdIP, domain.DNS_NAME, currentIP, domain.type);
            } else {
                await createRecord(currentIP, domain.DNS_NAME, domain.type, domain.proxied);
            }
        }
    } catch (error) {
        console.error("Error: ", error);
    }

    rl.question("Press Enter to exit...\n", () => {
        rl.close();
    });
}

main();
