import React from 'react'
import PropTypes from 'prop-types'
import { PrivacyPolicyPageTemplate } from '../../templates/privacypolicy-page'

const PrivacyPolicyPreview = ({ entry, widgetFor }) => (
  <PrivacyPolicyPageTemplate
    title={entry.getIn(['data', 'title'])}
    content={widgetFor('body')}
  />
)

PrivacyPolicyPagePreview.propTypes = {
  entry: PropTypes.shape({
    getIn: PropTypes.func,
  }),
  widgetFor: PropTypes.func,
}

export default PrivacyPolicyPagePreview
