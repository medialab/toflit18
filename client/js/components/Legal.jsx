/**
 * TOFLIT18 Client Legal Notice Component
 * ======================================
 *
 */
import React, {Component} from 'react';

export default class Legal extends Component {
  render() {
    return (
      <main className="container-fluid no-padding">
        <div className="section-heading">
          <div className="text-heading">
            <div className="row">
              <div className="col-sm-4 col-md-3">
                <h1>Legal Notice</h1>
              </div>
              <div className="col-sm-8 col-md-5">
                <p className="hidden-xs"></p>
              </div>
            </div>
          </div>
        </div>
        <div className="container content">
          <div className="row">
            <div className="col-sm-10 col-sm-offset-1">
              <h2>The contents of this site were supplied by</h2>
              <p>
<b>Sciences Po</b> <br/>
27 rue Saint-Guillaume<br/> 
75337 Paris Cedex 07 <br/>
Tel.: 01 45 49 50 50 <br/>
Fax.: 01 42 22 31 26 <br/>
Contact webmaster: medialab ( AT ) sciencespo ( DOT ) fr
              </p>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-10 col-sm-offset-1">
              <h2>Publisher</h2>
              <p>Frédéric Mion, President of Sciences Po</p>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-10 col-sm-offset-1">
              <h2>Hosting</h2>
              <p>This internet site is hosted by Fondation Nationale des Sciences Politiques (FNSP), Sciences Po - Direction des Systèmes d'Information</p>
              <p>APE Code: 803Z <br/>
              27, rue saint Guillaume<br/> 
              75337 Paris cedex 07<br/>
              </p>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-10 col-sm-offset-1">
              <h2>Industrial and Intellectual Property</h2>
              <p className="lead">source code</p>
              <p>The source code of this web application is available on <a href="https://github.com/medialab/toflit18">github</a> under license AGPLv3.</p>
<p className="lead">data</p>
<p>The data you can extract from this webside are under <a href="http://opendatacommons.org/licenses/odbl/1.0/">license ODbL</a>.</p>
<p>To access the full data collected by the project, please contact Guillaume Daudin (guillaume.daudin@dauphine.fr).</p>
<p className="lead">misc</p>
<p>Except for explicitly licensed elements (website source codes), all information on this web site (text, photos, logos…) is protected by the copyrights held by Sciences Po or their partners.<br/>
Therefore, the information may not be reproduced, modified, republished, re-aired, translated, distributed or reused in any manner, without the written consent of Sciences Po.<br/>
The Sciences Po site’s title, concept and form, as well as its content, such as news, descriptions, illustrations and original images and their organisation, and any software compilation, source code and other elements contained on the Sciences Po site are the property of Sciences Po.
              </p>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-10 col-sm-offset-1">
              <h2>Hypertext Links</h2>
              <p>Our pages also contain links to other sites for which we are in no manner responsible, neither regarding their adhesion to public order or good conduct, on the one hand, nor regarding their personal data privacy policies and use, on the other.<br/>
By accessing an outside site, through a hypertext link, you accept that this access is carried out at your own risk. Therefore, Sciences Po will in no way be held responsible for any direct or indirect damages resulting from your access to an outside site through a hypertext link"
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }
}
