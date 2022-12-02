const fetch = require("cross-fetch")
const AWS = require("aws-sdk")

exports.lambdaHandler = async (event, context, callback) => {
  const location = event?.location
  const externalId = location?.externalId ?? ""

  console.log("Input for get all orders for a location:", event)

  const s3 = new AWS.S3({
    endpoint: "http://host.docker.internal:4566",
    s3ForcePathStyle: true,
  })

  if (externalId === "") {
    console.log(`Can not fetch orders for partner location missing an externalId ${JSON.stringify(location)} `)
    callback(null, {
      orders: [],
    })
    return
  }

  const toastApiSandBoxHostUrl = "https://ws-sandbox.eng.toasttab.com"
  // TODO: Hard coding order duration for now.
  const toastGetLocationOrdersUrlParams = new URLSearchParams({
    startDate: "2022-03-16T13:00:59.630Z",
    endDate: "2022-03-17T06:46:59.630Z",
    pageSize: 5,
  }).toString()

  const toastAuthAccessToken = event?.toastAuthAccessToken
  const toastGetLocationOrdersUrl = `${toastApiSandBoxHostUrl}/orders/v2/ordersBulk?`.concat(
    toastGetLocationOrdersUrlParams,
  )

  console.log(`Fetching Toast orders for the partner location ${JSON.stringify(location)}`)

  const response = await fetch(toastGetLocationOrdersUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${toastAuthAccessToken}`,
      "Toast-Restaurant-External-ID": externalId,
    },
  })

  const orders = await response?.json()

  const orderKeys = []

  for (const order of orders) {
    orderKeys.push(`${order.guid}.json`)
    try {
      await s3.putObject({
        Bucket: "partner-location-orders",
        Key: `${order.guid}.json`,
        Body: JSON.stringify(order),
        ContentType: "application/json"
      }).promise()
      console.log("order payload createdDate:", order.createdDate)
    } catch (err) {
      console.log("Error uploading order to S3:", err)
    }
  }

  callback(null, {
    orders: orderKeys ?? [],
    location,
  })
}
