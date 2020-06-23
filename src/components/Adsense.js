import React from 'react';
import AdSense from 'react-adsense';
  
const Adsense = () => (
    <div>
        <AdSense.Google
            client='ca-pub-8245101512786403'
            slot='8774401691'
            style={{ display: 'block'}}
            format='auto'
            responsive='true'
        />
    </div>
);
  
export default Adsense;