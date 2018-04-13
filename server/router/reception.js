const props = require('../../common/index').props


module.exports = {

    homepage: (req, res) => res.render('/main/login', props.viewProps({
        metaTitle: 'Homepage1'
    })),

}
