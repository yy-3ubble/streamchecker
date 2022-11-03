const request = require('request-promise-native');

class Streaming {
    constructor(user) {
        this.user_id = user.id;
        this.name = user.name;
        this.service = user.service;
        this.channel_id = user.channel_id;
        this.twitter_id = user.twitter_id;
        this.finished_at = user.finished_at;
        this.title = user.title;
        this.viewer_count = user.viewer_count;
        this.live_id = user.live_id;
        this.thumbnail_url = user.thumbnail_url;
        this.started_at = user.started_at;
        this.tmp = null;
    }

    async checkState() {
        let result;
        switch (this.service) {
            case 'YouTube':
                result = await this.csYt();
                break;
            
            case 'Twitch':
                result = await this.csTw();
                break;
        }
        return result;
    }

    async csYt() {
        const options = {
            url: `https://www.youtube.com/channel/${this.channel_id}/live`,
            method: 'GET',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Accept-Language': 'en-US, en;q=0.5'
            }
        };

        this.tmp = await request(options);
        const islive = /"isLive"/.test(this.tmp);
        const isupcoming = /"isUpcoming"/.test(this.tmp);
        if (islive === true && isupcoming === false) {
            this.finished_at = null;
            return true;
        }
        return false;
    }

    async csTw() {
        const options = {
            url: `https://api.twitch.tv/helix/streams`,
            method: 'GET',
            qs: {
                'user_login': this.channel_id
            },
            headers: {
                'Authorization': 'hoge',
                'Client-Id': 'hogehoge'
            },
            json: true
        };

        this.tmp = await request(options);
        if (this.tmp.data[0]) {
            this.finished_at = null;
            return true;
        }
        return false;
    }

    parse() {
        switch (this.service) {
            case 'YouTube':
                this.pYt();
                break;
            case 'Twitch':
                this.pTw();
                break;
        }
    }

    pYt() {
        this.title = /<title>(.+?) - YouTube/.exec(this.tmp);
        this.title = this.title[1];
        this.viewer_count = /\{"viewCount":\{"runs":\[\{"text":"([0-9,]+)/.exec(this.tmp);
        this.viewer_count = Number(this.viewer_count[1].replace(',', ''));
        this.live_id = /<link rel="canonical" href="https:\/\/www.youtube.com\/watch\?v=(.+?)">/.exec(this.tmp);
        this.live_id = this.live_id[1];
        if (!this.thumbnail_url) {
            this.thumbnail_url = `https://i.ytimg.com/vi/${this.live_id}/mqdefault_live.jpg`;
        }
        if (!this.started_at) {
            this.started_at = Date.now();
        }
    }

    pTw() {
        this.title = this.tmp.data[0].title;
        this.viewer_count = this.tmp.data[0].viewer_count;
        this.live_id = this.channel_id;
        if (!this.thumbnail_url) {
            this.thumbnail_url = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${this.channel_id}-320x180.jpg`;
        }
        if (!this.started_at) {
            this.started_at = Date.now();
        }
    }

    end() {
        this.finished_at = Date.now();
    }
}

module.exports = Streaming;
