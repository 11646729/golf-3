export const prepareMessage = (data) => {
  var domainData = {
    type: "string",
    description: "The domain of the event",
  }

  var serviceData = {
    type: "string",
    description: "The name of the service that triggered the event",
  }

  var objectProperties = {
    correlationId: {
      type: "string",
      description: "The ID of the user",
    },
    domain: domainData,
    service: serviceData,
  }

  var requiredData = ["correlationId", "domain"]

  var dataObjectItemId = {
    type: "string",
    description: "The ID of the shopping item",
  }

  var dataObjectQuantity = {
    // "quantity": {
    type: "number",
    description: "How many items the user wants to add to their shopping cart",
    minimum: 1,
    maximum: 1000,
    default: 1,
    // }
  }

  var dataObject = {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "The ID of the user",
      },
      itemId: dataObjectItemId,
      quantity: dataObjectQuantity,
    },
  }

  var metadataObjectProperties = {
    metadata: {
      type: "object",
      properties: objectProperties,
      required: requiredData,
    },
    data: dataObject,
  }

  var message = {
    $id: "https://example.com/AddedItemToCart.json",
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "AddedItemToCart",
    type: "object",
    properties: metadataObjectProperties,
  }

  return JSON.stringify(message)
}
