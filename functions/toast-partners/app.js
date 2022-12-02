const fetch = require("cross-fetch")

const fetchToastPartnersQuery = `
query Partners($input: GetPartnersInput) {
  partners(input: $input) {
    id
    name
    locations {
      id
      name
      partnerId
      externalId
    }
  }
}
`

const fetchToastPartnersVariables = {
  input: {
    filter: {
      provider: "Toast"
    }
  }
}

exports.lambdaHandler = async (event, context, callback) => {
  const posCognitoAccessToken = event["posCognitoAccessToken"]
  const gqlTargetDomain = "http://192.168.1.68:3333/graphql"

  console.log("THIS IS THE posCognitoAccessToken token in get partner locations", posCognitoAccessToken)

  try {
    const response = await fetch(gqlTargetDomain, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${posCognitoAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: fetchToastPartnersQuery,
        variables: fetchToastPartnersVariables,
      }),
    })
  
    const partnerLocations = await response?.json()
    console.log("partner locations:", partnerLocations)
  
    callback(null, {
      partners: partnerLocations?.data?.partners ?? [],
    })
  } catch (err) {
    console.log("Error fetching toast partners:", err)
  }

}
