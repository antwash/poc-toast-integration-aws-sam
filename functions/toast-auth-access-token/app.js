const fetch = require("cross-fetch")

exports.lambdaHandler = async (event, context, callback) => {
  const toastApiSandBoxHostUrl = "https://ws-sandbox.eng.toasttab.com"
  const toastGetAuthTokenUrl = `${toastApiSandBoxHostUrl}/authentication/v1/authentication/login`
  const toastAuthClientId = "toast-auth-client-id-to-get-a-token"
  const toastAuthClientSecret = "toast-auth-client-secret-to-get-a-token"

  try {
    const response = await fetch(toastGetAuthTokenUrl, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId: toastAuthClientId,
        clientSecret: toastAuthClientSecret,
        userAccessType: "TOAST_MACHINE_CLIENT",
      }),
    })

    const data = await response?.json()
    const accessToken = data?.token?.accessToken

    console.log("THIS IS THE TOAST ACCESS TOKEN:", accessToken)
    callback(null, {
      toastAuthAccessToken: accessToken
    })
  } catch (err) {
    console.log(`Error fetching an access token from Toast API and inserting value into DynamoDB:`, JSON.stringify(err))
    callback(null, {
      toastAuthAccessToken: ""
    })
  }
}
