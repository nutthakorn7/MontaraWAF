# Contributing to Montara WAF

Thank you for your interest in contributing! 🎉

## Development Setup

1. **Fork & Clone**
   ```bash
   git clone https://github.com/your-username/montara-waf.git
   cd montara-waf
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## Development Workflow

### Before Starting
- Create a new branch: `git checkout -b feature/your-feature`
- Check existing issues/PRs

### During Development
- Run tests frequently: `npm test`
- Check linting: `npm run lint`
- Use Storybook for UI components: `npm run storybook`

### Before Submitting
1. Run all tests: `npm test && npm run test:e2e`
2. Run linting: `npm run lint`
3. Build successfully: `npm run build`
4. Update documentation if needed

## Code Style

- Use TypeScript
- Follow ESLint rules
- Use Tailwind CSS for styling
- Create reusable components in `src/components/ui/`

## Testing

- **Component tests**: Add to `src/__tests__/`
- **E2E tests**: Add to `e2e/`
- Write meaningful test descriptions
- Aim for high coverage on new code

## Pull Request Process

1. Update README.md if needed
2. Add tests for new features
3. Ensure CI passes
4. Request review

## Questions?

Open an issue or start a discussion.
