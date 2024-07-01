const fetch = require("node-fetch")

var outJson = {
    ruleset: "Stoat Lord Stuff",
    cards: [],
    sigils: {},
}

async function load() {
    let cardsRaw
    let sigilRaw
    await fetch(
        "https://opensheet.elk.sh/152SuTx1fVc4zsqL4_zVDPx69sd9vYWikc2Ce9Y5vhJE/1",
    )
        .then(res => res.json())
        .then(json => {
            cardsRaw = json
        })

    await fetch(
        "https://opensheet.elk.sh/152SuTx1fVc4zsqL4_zVDPx69sd9vYWikc2Ce9Y5vhJE/2",
    )
        .then(res => res.json())
        .then(json => {
            sigilRaw = json
        })

    cardsRaw.pop()
    for (let card of cardsRaw) {
        let cardFormated = {}
        if (Object.keys(card).length == 0) continue
        cardFormated.name = card["Name"]
        cardFormated.temple = card["Temple"]
        cardFormated.tier = card["Rarity"]
        cardFormated.cost = card["Cost"]
        cardFormated.attack = card["Power"]
        cardFormated.health = card["Health"]
        cardFormated.description = card["Flavor"]
        cardFormated.token = card["Token"]

        // Cost Parsing
        card["Cost"] = card["Cost"]
            .replace("Bones", "Bone")
            .replace("Gems", "Mox")
            .replace("Gem", "Mox")
            .toLowerCase()
        for (let cost of card["Cost"].split(", ")) {
            cost = cost.trim().toLowerCase()
            let temp = cost.split(" ")
            if (cost.includes("shattered")) {
                if (!cardFormated["shattered"]) cardFormated["shattered"] = []
                for (let i = 0; i < temp[0]; i++) {
                    cardFormated["shattered"].push(`shattered_${temp[2]}`)
                }
            } else if (
                ["sapphire", "ruby", "emerald", "prism"].some(i =>
                    cost.includes(i),
                )
            ) {
                if (!cardFormated["mox"]) cardFormated["mox"] = []
                for (let i = 0; i < temp[0]; i++) {
                    cardFormated["mox"].push(temp[1])
                }
            } else if (cost.includes("free")) {
                null
            } else if (temp.length > 0) {
                cardFormated[temp[1]] = parseInt(temp[0])
            }
        }

        if (card["Sigil 1"] !== "") {
            cardFormated.sigils = []

            if (card["Sigil 2"] !== "") {
                cardFormated.sigils.push(card["Sigil 2"])
            }
            if (card["Sigil 3"] !== "") {
                cardFormated.sigils.push(card["Sigil 3"])
            }
            if (card["Sigil 4"] !== "") {
                cardFormated.sigils.push(card["Sigil 4"])
            }
        }

        cardFormated.pixport_url = card["Image"]
        outJson.cards.push(cardFormated)
    }
    for (sigil of sigilRaw) {
        if (sigil["Description"])
            outJson.sigils[sigil["Name"]] = sigil["Description"].replaceAll(
                "\n",
                "",
            )
    }
    return outJson
}

module.exports = {
    load,
}
