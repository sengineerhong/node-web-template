const joi = require('joi');

module.exports = {

    /* get traffic history data by strDate */
    get_trf_history: {
        query: {
            strDate: joi.date().required()
        }
    },
    /* get traffic bps usage by strDate & range(min) */
    get_trf_bpsUsage: {
        query: {
            strDate: joi.date().required(),
            range: joi.number().required()
        }
    },
    /* get traffic bps usage by strDate & range(min) */
    get_trf_viewer: {
        query: {
            strDate: joi.date().required(),
            interval: joi.number().required(),
            profileId: joi.string().required()
        }
    },
    /* get traffic dstas (request whoisapi) */
    get_trf_dstas: {
        params: {
            dstAsNum: joi.number().required()
        }
    },
    /* get traffic iface out list by profileId or current iface list(all) */
    get_trf_ifaceList: {
        query: {
            profileId: joi.string().required()
        }
    },
    /* get traffic profile by profileId */
    get_trf_profile: {
        params: {
            profileId: joi.string().required()
        }
    },
    /* update traffic profile by profileId */
    update_trf_profile: {
        params: {
            profileId: joi.string().required()
        },
        body: {
            updObj: joi.object().keys({
                profileName: joi.string(),
                ifaceArry: joi.array().min(1)
            })
        }
    },
    /* create traffic profile */
    create_trf_profile: {
        body: {
            profileObj: joi.object().keys({
                profileName: joi.string(),
                ifaceArry: joi.array().min(1)
            })
        }
    },
    /* delete traffic profile */
    delete_trf_profile: {
        params: {
            profileId: joi.string().required()
        }
    },
    /* get traffic ifaceout/peeripsrc list and alias field data by strDate */
    get_trf_alias: {
        query: {
            strDate: joi.date().required()
        }
    },
    // update ifaceout/peeripsrc alias
    update_trf_alias: {
        params: {
            ifaceOut: joi.string().required()
        },
        body: {
            strDate: joi.date().required(),
            ifaceOutAs: joi.string().required(),
            peerIpSrc: joi.string().required(),
            peerIpSrcAs: joi.string().required()
        }
    },
    // update at once ifaceout/peeripsrc alias
    update_trf_alias_all: {
        body: {
            ifoAsArray: joi.array().min(1)
        }
    },

    /**
     * User Validation
     */
    // POST - /user/sign-up
    user_sign_up: {
        body: {
            user_id: joi.string().required(),
            password: joi.string().required()
        }
    },
    // POST - /user/sign-in
    user_sign_in: {
        body: {
            user_id: joi.string().required(),
            password: joi.string().required()
        }
    },

    /**
     * Board Validation
     */
    // POST - /board
    board_write: {
        body: {
            title: joi.string().required(),
            contents: joi.string().required()
        }
    },
    // GET - /board/:board_id
    board_read: {
        params: {
            board_id: joi.number().required()
        }
    },
    // POST - /board/:board_id/comment
    board_comment: {
        params: {
            board_id: joi.number().required()
        },
        body: {
            comment: joi.string().required()
        }
    }
};
