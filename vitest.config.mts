export default {
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true
  }
}
