const fetch = require("cross-fetch");

exports.lambdaHandler = async (event, context, callback) => {
  // Fetch access token from the POS integration cognito app client
  // and write token to DynamoDB
  const nativeClientId = "cognito-client-id"
  const nativeClientSecret = "cognito-client-secret"
  const basicHeader = `${nativeClientId}:${nativeClientSecret}`


  const params = new URLSearchParams()
  params.append("grant_type", "client_credentials")
  params.append("scope", "hyph.dev/pos.read")

  try {
    const response = await fetch("url-of-a-cognito-client", {
      method: "POST",
      headers: {
        Accept: "*/*",
        Authorization: `Basic ${Buffer.from(basicHeader).toString("base64")}`,
      },
      body: params,
    })

    const data = await response?.json()
    const { access_token } = data
    return callback(null, access_token)
  } catch (err) {
    console.log(
      `Error fetching the POS integration Cognito access token and inserting into DynamoDB`,
      JSON.stringify(err),
    )
    return callback(null, "")
  }
}
