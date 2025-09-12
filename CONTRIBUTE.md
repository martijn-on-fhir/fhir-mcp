# Contributing to FHIR MCP Server

Thank you for your interest in contributing to the FHIR MCP Server project! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature or fix
4. Make your changes
5. Submit a pull request

## Development Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build the project
npm run build

# Run tests
npm test
```

## Code Standards

### TypeScript
- Use TypeScript for all source files
- Maintain strong typing - avoid `any` types
- Follow existing code patterns and conventions

### Code Style
- Use 2 spaces for indentation
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Testing
- Write tests for new features
- Ensure all tests pass before submitting PR
- Aim for good test coverage

## Pull Request Process

1. **Branch Naming**
   - `feature/description` for new features
   - `fix/description` for bug fixes
   - `docs/description` for documentation

2. **Commit Messages**
   - Use clear, descriptive commit messages
   - Start with a verb (Add, Fix, Update, Remove)
   - Reference issues when applicable (#123)

3. **PR Description**
   - Clearly describe the changes
   - Link related issues
   - Include testing steps
   - Add screenshots for UI changes

## Testing Guidelines

### Manual Testing
Test with different FHIR servers:
```bash
# HAPI FHIR R4
npm start https://hapi.fhir.org/baseR4

# IBM FHIR Server
npm start https://fhirtest.uhn.ca/baseR4

# Firely Server
npm start https://server.fire.ly
```

### Unit Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Project Structure

```
fhir-mcp/
├── src/
│   ├── index.ts        # Main entry point
│   ├── config.ts       # Configuration management
│   ├── tools/          # MCP tool implementations
│   └── types/          # TypeScript type definitions
├── dist/               # Compiled output
├── tests/              # Test files
└── docs/               # Documentation
```

## Areas for Contribution

### Current Priorities
- [ ] Expand test coverage
- [ ] Add support for more FHIR operations
- [ ] Improve error handling and logging
- [ ] Add Dutch FHIR profile support
- [ ] Performance optimizations
- [ ] Documentation improvements

### Good First Issues
Look for issues labeled `good-first-issue` in the GitHub repository.

## Questions and Support

- Open an issue for bug reports or feature requests
- Use discussions for questions and ideas
- Join our community chat (if available)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Code of Conduct

### Our Standards
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Accept constructive criticism gracefully
- Focus on what's best for the community

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or insulting comments
- Public or private harassment
- Publishing others' private information

## Recognition

Contributors will be recognized in:
- The project's contributors list
- Release notes for significant contributions
- Special mentions for exceptional contributions

Thank you for contributing to FHIR MCP Server!