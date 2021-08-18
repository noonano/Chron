const { VoiceState } = require('discord.js')

module.exports = {
    name: 'voiceStateUpdate',
    once: false,
    /**
     * 
     * @param {VoiceState} oldState 
     * @param {VoiceState} newState 
     * @returns 
     */
    async execute(oldState, newState) {
        if (oldState.guild.id !== '575341681596039178') return
        if (newState.member.roles.cache.has(role => role.name !== 'Bot Tester')) return console.log('returned')



        //if user joined
        if (!oldState.channel) {
            if (newState.channel) {
                let userCount = newState.channel.members?.filter(member => !member.user.bot)
                if (userCount.size >= 2) {
                    userCount.forEach(value => {
                        if (newState.client.voiceExp.has(value.id)) {
                            return
                        }
                        else {
                            newState.client.voiceExp.set(value.id, Date.now())
                        }
                    })
                }
            }
        }

        //if user left the channel
        if (oldState.channel) {
            if (!newState.channel) {
                let userCount = oldState.channel.members?.filter(member => !member.user.bot || member.id === oldState.member.id)
                console.log(oldState.client.voiceExp.get(oldState.member.id))
                console.log(Date.now())
                const voiceTime = Date.now() - oldState.client.voiceExp.get(oldState.member.id)
                oldState.client.giveXpVoice(oldState.member, voiceTime)
                oldState.client.voiceExp.delete(oldState.member.id)

                if (userCount.size == 1) {
                    const voiceTime = Date.now() - oldState.client.voiceExp.get(userCount.first().id)
                    oldState.client.giveXpVoice(userCount.first(), voiceTime)
                    oldState.client.voiceExp.delete(userCount.first().id)
                }
            }
        }

    }
}