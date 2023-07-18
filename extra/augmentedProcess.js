const fetch = require("node-fetch")

var imfJson = {
	ruleset: "Augmented",
	hammers_per_turn: 1,
	ant_limit: 2,
	deck_size_min: 1,
	max_commons_main: 4,
	max_commons_side: 10,
	num_candles: 2,
	variable_attack_nerf: false,
	allow_snuffing_candles: true,
	opt_actives: false,
	portrait: "portraits/Stoat",
	description: "Augmented Ruleset in IMF, parse by Magpie.",
	cards: [],
	sigils: {},
}

async function load() {
	let cardsRaw
	let sigilRaw
	await fetch(
		`https://opensheet.elk.sh/1tvTXSsFDK5xAVALQPdDPJOitBufJE6UB_MN4q5nbLXk/Cards`
	)
		.then((res) => res.json())
		.then((json) => {
			cardsRaw = json
		})

	await fetch(
		`https://opensheet.elk.sh/1tvTXSsFDK5xAVALQPdDPJOitBufJE6UB_MN4q5nbLXk/Sigils`
	)
		.then((res) => res.json())
		.then((json) => {
			sigilRaw = json
		})
	for (card of cardsRaw) {
		let cardFormated = {}
		cardFormated["name"] = card["Card Name"]
		cardFormated["temple"] = card["Temple"]
		cardFormated["tier"] = card["Tier"]

		// parsing cost
		card["Cost"] = card["Cost"]
			.replace("bones", "bone")
			.replace("sapphires", "sapphire")
			.replace("rubies", "ruby")
			.replace("prisms", "prism")
		for (let cost of card["Cost"].split("+")) {
			cost = cost.trim().toLowerCase()
			let temp = cost.split(" ")
			if (cost.includes("shattered")) {
				if (!cardFormated["shattered"]) cardFormated["shattered"] = []
				for (let i = 0; i < temp[0]; i++) {
					cardFormated["shattered"].push(`shattered_${temp[2]}`)
				}
			} else if (
				["sapphire", "ruby", "emerald", "prism"].some((i) =>
					cost.includes(i)
				)
			) {
				if (!cardFormated["mox"]) cardFormated["mox"] = []
				for (let i = 0; i < temp[0]; i++) {
					cardFormated["mox"].push(temp[1])
				}
			} else if (temp.length > 0) {
				cardFormated[temp[1]] = parseInt(temp[0])
			}
		}

		// parsing health and power
		cardFormated["health"] = card["Health"]
		cardFormated["attack"] = card["Power"]
		cardFormated["sigils"] = card["Sigils"]
			? card["Sigils"].split(", ")
			: []

		if (card["Token"]) cardFormated["token"] = card["Token"]
		if (card["Traits"])
			cardFormated["traits"] = card["Traits"]
				? card["Traits"].split(", ")
				: []
		if (card["Tribes"]) cardFormated["tribes"] = card["Tribes"]

		cardFormated["description"] = card["Flavor Text"]

		cardFormated[
			"footnote"
		] = `This card was made by ${card["Credit"]}.\nLast Edited: ${card["edited"]}`
		// console.log(cardFormated["sigils"], !cardFormated["sigils"])
		if (!cardFormated["sigils"] || cardFormated["sigils"].length <= 0) {
			delete cardFormated["sigils"]
		}
		cardFormated["art"] = card["Art"]

		imfJson.cards.push(cardFormated)
	}

	for (sigil of sigilRaw) {
		if (sigil["Text"])
			imfJson.sigils[sigil["Name"]] = sigil["Text"].replaceAll("\n", "")
	}

	imfJson.cards.push({
		name: "Maid Goat",
		attack: 1,
		health: 3,
		blood: 2,
		sigils: ["Worthy Sacrifice", "Morsel"],
		noArt: true,
	})
	return imfJson
}

module.exports = {
	load,
}
