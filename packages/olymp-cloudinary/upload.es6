import React, { Component, Fragment } from 'react';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import Helmet from 'react-helmet';

@withApollo
export default class Uploader extends Component {
  onClick = async () => {
    const { client, app } = this.props;
    const timestamp = Math.round(new Date().getTime() / 1000);
    const { data } = await client.query({
      query: gql`
        query signUpload($folder: String, $callback: String, $timestamp: Int!) {
          signUpload(
            folder: $folder
            callback: $callback
            timestamp: $timestamp
          )
        }
      `,
      variables: {
        callback: 'http://widget.cloudinary.com/cloudinary_cors.html',
        timestamp,
        folder: `/${app}`
      }
    });

    const { signUpload } = data;
    if (!signUpload) {
      throw new Error('No signature');
    }
    window.cloudinary.openUploadWidget(
      {
        cloud_name: 'djyenzorc',
        sources: ['local', 'url', 'dropbox', 'image_search'],
        folder: `/${app}`,
        api_key: '179442986443332',
        upload_signature: signUpload,
        upload_signature_timestamp: timestamp,
        theme: 'white',
        dropbox_app_key: 'c3p2qdebpns6z3t',
        text: {
          powered_by_cloudinary: 'Uploader',
          'sources.local.title': 'Meine Dateien',
          'sources.local.drop_file': 'Datei hier fallen lassen',
          'sources.local.drop_files': 'Dateien hier fallen lassen',
          'sources.local.drop_or': 'oder',
          'sources.local.select_file': 'Datei auswählen',
          'sources.local.select_files': 'Dateien auswählen',
          'sources.url.title': 'URL',
          'sources.url.note': 'URL:',
          'sources.url.upload': 'Upload',
          'sources.url.error': 'Bitte eine vollständige Internet URL angeben.',
          'sources.camera.title': 'Webcam',
          'sources.camera.note':
            'Bitte Zugriff auf die Webcam zulassen, positionieren Sie sich vor der Kamera und klicken Sie "Auslösen":',
          'sources.camera.capture': 'Auslösen',
          'progress.uploading': 'Lädt hoch...',
          'progress.upload_cropped': 'Hochladen',
          'progress.processing': 'Verarbeiten...',
          'progress.retry_upload': 'Erneut versuchen',
          'progress.use_succeeded': 'OK',
          'progress.failed_note':
            'Manche Dateien konnten nicht hochgeladen werden.'
        }
      },
      (error, result) => {
        console.log(error, result);
      }
    );
  };
  render() {
    return (
      <Fragment>
        <a href="javascript:;" onClick={this.onClick}>
          {this.props.children}
        </a>
        <Helmet>
          <script
            src="//widget.cloudinary.com/global/all.js"
            type="text/javascript"
          />
        </Helmet>
      </Fragment>
    );
  }
}
