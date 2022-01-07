const { Client, Intents, MessageEmbed  } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const prefix = '!';
var axios = require('axios');
require('dotenv').config()

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    setInterval(function(){ 
        axios.get(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${process.env.ETHERSCAN_API}`).then(response => {
                    client.user.setActivity(`GWEI: ${response.data.result.ProposeGasPrice}`, { type: 'WATCHING' });
                }).catch(function (error) {
                    console.log(error)
                })
    }, 5000);
});

client.on('message', async (message) => {
    const args = message.content.trim().split(/ +/g);
    const cmd = args[0].slice(prefix.length).toLowerCase();
    if(message.author.bot) return;
    if(cmd == "opensea") { 
        axios.get(`https://api.opensea.io/api/v1/collection/${args[1]}`, {
            headers: {
                'Accept': 'application/json',
            }
            }).then(response => {
            console.log(response.data);
            const infoEmbed = new MessageEmbed()
                .setColor('#1362b1')
                .setTitle(response.data.collection.name)
                .setURL(response.data.collection.external_url)
                .setThumbnail(response.data.collection.large_image_url)
                .addFields(
                    { name: 'Description', value: `${response.data.collection.description}`, inline: false },
                    { name: 'Total Quantity:', value: `${response.data.collection.stats.count}`, inline: true },
                    { name: 'Number of Owners:', value: `${response.data.collection.stats.num_owners}`, inline: true },
                    { name: 'Floor Price:', value: `${response.data.collection.stats.floor_price}Ξ`, inline: true },
                    { name: 'Twitter:', value: `[${response.data.collection.twitter_username}](https://twitter.com/${response.data.collection.twitter_username})`, inline: true },
                    { name: 'Discord', value: `[${response.data.collection.discord_url}](${response.data.collection.discord_url})`, inline: true },
                    { name: '30d Volume:', value: `${Math.round(response.data.collection.stats.thirty_day_volume)}Ξ`, inline: true },
                )
                .setTimestamp()
            message.channel.send({embeds: [infoEmbed]})
        }).catch(function (error) {
            message.channel.send("Error: " + error);
        })
    }


    if(cmd == "balance") {
        try {
            const ethBalance = (await axios.get(`https://api.etherscan.io/api?module=account&action=balance&address=${args[1]}&tag=latest&apikey=${process.env.ETHERSCAN_API}`)).data.result;
            const ethPrice = (await axios.get(`https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${process.env.ETHERSCAN_API}`)).data.result.ethusd;
            let balance = (ethBalance / Math.pow(10, 18))
            message.channel.send(`Balance of **${args[1]}** is **${balance.toFixed(3)}Ξ**\nThe price of ETH is **$${ethPrice}**, Therefore the value of this account is **$${(balance * ethPrice).toFixed(2)}**`);
          } catch (error) {
            message.channel.send(error);
          }
    }
});

client.login(process.env.DISCORD_TOKEN);
