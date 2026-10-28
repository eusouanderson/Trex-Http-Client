# Security Policy

## Supported Versions

The Trex-Http-Client project aims to provide a secure and reliable HTTP client for developers. Security updates are prioritized for actively maintained versions.

The following table describes the project's security support policy:

| Version | Supported |
| ------- | --------- |
| Latest stable release | :white_check_mark: |
| Previous releases | :x: |
| Development and pre-release versions | :x: |

Only the latest stable release is officially supported for security updates. Users are encouraged to upgrade to the latest release to benefit from security fixes and improvements.

Security support may vary depending on the severity of a vulnerability and the availability of a fix.

## Reporting a Vulnerability

The Trex-Http-Client project takes security vulnerabilities seriously. We appreciate responsible disclosure and the efforts of security researchers and users who help keep the project secure.

### How to Report

**Please do not disclose security vulnerabilities through public GitHub issues, pull requests, or discussions.**

To report a vulnerability, use one of the following methods:

1. **GitHub Private Vulnerability Reporting:** If enabled for this repository, navigate to the repository's **Security** tab and select **Report a vulnerability** to submit a private security advisory.
2. **GitHub Security Advisories:** Use the repository's private vulnerability reporting feature to provide technical details without publicly exposing the vulnerability.

Please include as much of the following information as possible:

- A clear description of the vulnerability and its potential impact.
- The affected version or commit.
- Steps to reproduce the issue.
- Proof-of-concept code or screenshots, when applicable.
- Any suggested mitigation or remediation.
- Information about the environment in which the vulnerability was discovered.

Please avoid including real access tokens, passwords, API keys, personal data, or other sensitive information in your report.

### Response Timeline

The project aims to follow these response targets:

- **Initial acknowledgment:** Within 7 calendar days of receiving a report.
- **Initial assessment:** Within 14 calendar days, depending on complexity and severity.
- **Status updates:** At least every 14 calendar days while the report remains actively under investigation.

These timelines are targets, not guaranteed service-level agreements. Complex vulnerabilities may require additional investigation.

### What to Expect

After receiving a report, the maintainers will:

1. Review and validate the reported issue.
2. Assess its severity, exploitability, and potential impact.
3. Determine whether the vulnerability affects the project.
4. Work on a fix or mitigation when appropriate.
5. Coordinate responsible disclosure with the reporter whenever possible.

If the report is accepted, the maintainers will work toward an appropriate fix and may publish a security advisory and a patched release.

If the report is declined, the reporter will receive an explanation when reasonably possible. Reports may be declined if the issue cannot be reproduced, does not represent a security vulnerability, or falls outside the project's scope.

### Scope

Security reports relevant to Trex-Http-Client may include, but are not limited to:

- Exposure or unintended persistence of sensitive data, including API keys, access tokens, and authorization headers.
- Cross-site scripting (XSS) or other client-side injection vulnerabilities.
- Insecure handling of HTTP requests, responses, or user-provided content.
- Vulnerabilities involving request collections, environments, variables, or local storage.
- Insecure authentication or authorization handling.
- Dependency vulnerabilities that can affect the security of the application.
- Security misconfigurations in the build, deployment, or GitHub Actions workflows.

### Out of Scope

The following issues are generally outside the scope of this policy unless they demonstrate a concrete security impact:

- Vulnerabilities in third-party services outside the project's control.
- Issues affecting unsupported or obsolete versions only.
- Reports based solely on theoretical concerns without a demonstrable security impact.
- Automated scanner findings without sufficient evidence of exploitability.
- Social engineering, phishing, or physical attacks against project contributors.
- Denial-of-service attacks against third-party APIs accessed by users.

### Responsible Disclosure

Please allow the maintainers reasonable time to investigate and address a reported vulnerability before publicly disclosing it.

We ask reporters not to exploit vulnerabilities beyond what is necessary to demonstrate the issue, access other users' data, disrupt services, or compromise systems they do not own or have permission to test.

The project will make reasonable efforts to coordinate disclosure and credit the reporter, where appropriate and with their consent.

### Security Updates

Security fixes may be released through normal project releases or dedicated security releases, depending on severity.

Users should keep Trex-Http-Client updated and review published GitHub Security Advisories and release notes for relevant security information.

Thank you for helping make Trex-Http-Client safer for everyone.
