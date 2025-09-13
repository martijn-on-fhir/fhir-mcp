# Claude Code Review Setup Guide

This guide helps you enable Claude AI code review for your FHIR MCP Server repository.

## Prerequisites

1. **Anthropic API Key**: You'll need access to Claude API
2. **GitHub Repository**: Admin access to configure secrets and actions

## Setup Steps

### 1. Get Anthropic API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key (starts with `sk-ant-api03-...`)

### 2. Configure GitHub Secrets

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secret:
   - Name: `ANTHROPIC_API_KEY`
   - Value: Your Anthropic API key from step 1

### 3. Enable GitHub Actions

1. Go to **Actions** tab in your repository
2. If prompted, click **"I understand my workflows, go ahead and enable them"**
3. The Claude review workflows should now be visible

## Workflows Included

### Claude Code Review (`claude-code-review.yml`)
- **Triggers**: On PR open/update, or when @claude is mentioned in comments
- **Focus**: General code quality, FHIR compliance, TypeScript best practices
- **Features**: 
  - Healthcare-specific code review
  - FHIR R4 compliance checking
  - Type safety and error handling
  - Security considerations for PHI

### Claude Security Review (`claude-security-review.yml`)  
- **Triggers**: On PR open/update
- **Focus**: Security vulnerability detection
- **Features**:
  - Healthcare data security (PHI, HIPAA)
  - Common security vulnerabilities
  - Dependency security analysis
  - FHIR-specific security patterns

## How It Works

### Automatic Reviews
- Every new pull request gets automatically reviewed
- Claude analyzes code changes and posts review comments
- Summary comments provide overview of findings

### Interactive Reviews  
- Mention `@claude` in PR comments to ask specific questions
- Claude can explain code, suggest improvements, or clarify FHIR concepts
- Great for getting quick feedback during development

### Review Categories

**Code Quality:**
- TypeScript type safety
- Error handling patterns
- Code organization and maintainability
- Documentation quality

**FHIR Compliance:**
- Resource structure validation
- Proper use of FHIR operations
- Healthcare interoperability best practices
- Clinical data modeling

**Security:**
- PHI handling and privacy
- Authentication/authorization
- Input validation and sanitization
- Dependency vulnerabilities

## Customization

You can customize the reviews by editing the workflow files:

- **System Prompts**: Modify the `system_prompt` in workflows
- **File Patterns**: Adjust `include_patterns` and `exclude_patterns`
- **Security Focus**: Update security analysis criteria
- **Triggers**: Change when reviews run

## Usage Examples

### Getting Code Explanations
Comment on a PR: `@claude can you explain how this FHIR validation works?`

### Requesting Improvements  
Comment: `@claude please suggest improvements for this error handling`

### Security Analysis
Comment: `@claude are there any security concerns with this PHI handling?`

### FHIR Compliance
Comment: `@claude does this resource structure follow R4 standards?`

## Troubleshooting

### Action Not Running
- Check that `ANTHROPIC_API_KEY` secret is configured
- Verify GitHub Actions are enabled for the repository
- Check action logs for specific error messages

### Review Quality
- Customize system prompts for more specific feedback
- Adjust file patterns to focus on relevant code
- Use interactive comments for targeted questions

### API Limits
- Monitor API usage in Anthropic Console
- Consider rate limiting for high-volume repositories
- Use review triggers strategically

## Best Practices

1. **Use Interactive Reviews**: Ask specific questions for better feedback
2. **Focus File Patterns**: Review only relevant files to save API costs
3. **Combine with Human Review**: Claude enhances but doesn't replace human reviewers
4. **Address Security Findings**: Always investigate security-related feedback
5. **Iterate on Prompts**: Improve system prompts based on review quality

## Support

For issues with:
- **Claude API**: Contact Anthropic support
- **GitHub Actions**: Check GitHub documentation
- **FHIR Questions**: Refer to HL7 FHIR R4 specification
- **This Setup**: Create an issue in the repository

## Privacy and Security

- Claude only analyzes code in pull requests
- No persistent storage of your code
- API calls are encrypted in transit
- Follow your organization's AI tool policies

---

*This setup provides AI-powered code review specifically tailored for FHIR healthcare applications with Claude's advanced understanding of clinical data and security requirements.*