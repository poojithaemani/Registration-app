const fs = require("fs");
const path = require("path");

const envDir = path.join(__dirname, "src/environments");
const prodFile = path.join(envDir, "environment.prod.ts");
const devFile = path.join(envDir, "environment.ts");

if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

const prodContent = `
export const environment = {
  production: true,
  apiURL: '${process.env.API_BASE_URL}/api',
};
`;

const devContent = `
export const environment = {
  production: false,
  apiURL: '${process.env.API_BASE_URL}/api',
};
`;

fs.writeFileSync(prodFile, prodContent);
fs.writeFileSync(devFile, devContent);
