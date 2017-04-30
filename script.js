#!/usr/bin/env node

const program = require('./cliSetup')
const steps = require('./index')

process.exit(steps(program) ? 0 : 1)
