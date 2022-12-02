const fetch = require("cross-fetch")
const AWS = require("aws-sdk")

const createToastOrder = `
mutation CreateToastOrder($input: CreateToastOrderInput!) {
  createToastOrder(input: $input) {
    id
  }
}
`

exports.lambdaHandler = async (event, context, callback) => {
  const posCognitoAccessToken = event.posCognitoAccessToken
  const location = event.location
  const orderKey = event.order
  const gqlTargetDomain = "http://192.168.1.68:3333/graphql"

  const s3 = new AWS.S3({
    endpoint: "http://host.docker.internal:4566",
    s3ForcePathStyle: true,
  })

  console.log("The s3 key of the order:", orderKey)

  try {
    const object = await s3.getObject({
      Bucket: "partner-location-orders",
      Key: orderKey
    }).promise()

    const order = object.Body.toString('utf-8')

    console.log(`Ingesting partner ${location.partnerId} location id ${location.id} order ${JSON.stringify(order)}`)
    const createToastOrderVariables = {
      input: {
        partnerId: location.partnerId,
        locationId: location.id,
        rawPayloadJson: order,
      },
    }

    const response = await fetch(gqlTargetDomain, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${posCognitoAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: createToastOrder,
        variables: createToastOrderVariables,
      }),
    })

    const results = await response?.json()
    const orderId = results?.data?.createToastOrder?.id

    if (orderId) {
      console.log(`Created order ${orderId} for partner ${location.partnerId} at location ${location.id}`)
      callback(null, {
        orderId,
        locationId: location.id,
      })
    }

  } catch (err) {
    console.log(`Error fetching and ingesting the partner ${location.partnerId} location ${location.id} order with S3 key ${orderKey}:`, err)
  }
}
