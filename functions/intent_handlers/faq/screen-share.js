const {findProductsByTags} = require('./../../database/product')
const {getAllTags, checkTV, showFAQMessage, clarifyProductForFAQ, setContextForCartConfirm, getOrdinal} = require('../../utils')
const {Suggestion} = require('dialogflow-fulfillment')

/**
 *
 * @param {WebhookClient} agent
 * @return {Promise<void>}
 */
async function handleScreenShareIntent(agent) {
  console.log("screen-share Invoked", JSON.stringify(agent.parameters))
  const ordinal = getOrdinal(agent)
  let quantity = agent.parameters.quantity
  quantity = quantity === '' ? undefined : quantity
  let tags = getAllTags(agent.parameters.tags, agent.parameters.newTags)
  if(!checkTV(tags)) {
    agent.add("FAQ are supported only on TV")
    return
  }
  let products = await findProductsByTags(tags)
  if(products.length === 0) {
    tags = agent.parameters.tags = agent.parameters.newTags
    delete agent.parameters.ordinal
    products = await findProductsByTags(tags)
  }

  const index = (!ordinal || ordinal > products.length)
    ? undefined
    : ordinal - 1

  // if the ordinal was passed or only one product was fetched using the passed tags
  if (index !== undefined || await clarifyProductForFAQ(agent, tags, quantity, 'faq', 'discount' , products)) {
    let product = products[index || 0]
    showFAQMessage(agent, `Yes, you can easily share you phone, laptop, etc. screen to ${product.name}`)
    agent.add(new Suggestion('Add to cart'))
    setContextForCartConfirm(agent, tags, quantity, ordinal, 'faq', 'screen-share')
  }
}

module.exports = {handleScreenShareIntent}
