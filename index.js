'use strict'

const fp = require('fastify-plugin')
const AWS = require('aws-sdk')

async function fastifyAWSSDK (fastify, options) {
  const { namespace } = options
  delete options.namespace
  const client = options.client || AWS;
  AWS.config.getCredentials((err) => {
      if (err) {
        throw new Error(`AWS error on login: ${err}`)    
      }
  });
  if (namespace) {
    if (!fastify.aws) {
      fastify.decorate('aws', {})
    }
    if (fastify.aws[namespace]) {
      throw new Error(`AWS namespace already used: ${namespace}`)
    }
    fastify.aws[namespace] = client
    fastify.addHook('onClose', (instance, done) => {
      instance.aws[namespace].close(done)
    })
  } else {
    fastify
      .decorate('aws', client)
      .addHook('onClose', (instance, done) => {
        instance.aws.close(done)
      })
  }
}
module.exports = fp(fastifyAWSSDK, {
  fastify: '3.x',
  name: 'fastify-aws-sdk'
})