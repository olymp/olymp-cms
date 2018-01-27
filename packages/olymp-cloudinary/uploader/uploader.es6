import React from 'react';
import { createComponent } from 'react-fela';
import { Upload as AntUpload, Progress } from 'antd';
import { FaDropbox, FaFile } from 'olymp-icons';
import { withApollo } from 'react-apollo';
import Menu from 'olymp-ui/menu';
import { withState, compose, withHandlers } from 'recompose';
import gql from 'graphql-tag';
import DropboxChooser from './dropbox';

const Dragger = createComponent(
  () => ({
    '& .ant-upload': {
      padding: 0
    }
  }),
  p => <AntUpload.Dragger {...p} />,
  p => Object.keys(p)
);
const enhance = compose(
  withState('fileList', 'setFileList', []),
  withState('isUploading', 'setUploading', 0),
  withApollo,
  withHandlers({
    onChange: ({
      fileList,
      client,
      app = 'test',
      setUploading,
      onSuccess = () => {},
      onError = () => {}
    }) => async list => {
      if (list) {
        fileList = list;
      }

      let remaining = fileList.length;
      setUploading(remaining);
      const timestamp = Math.round(new Date().getTime() / 1000);
      const { data } = await client.query({
        query: gql`
          query signUpload($folder: String, $timestamp: Int!, $ocr: String) {
            signUpload(folder: $folder, timestamp: $timestamp, ocr: $ocr)
          }
        `,
        variables: {
          ocr: 'adv_ocr',
          timestamp,
          folder: `/${app}`
        }
      });

      const { signUpload } = data;
      if (!signUpload) {
        throw new Error('No signature');
      }

      const values = await Promise.all(
        fileList.map(file => {
          const body = new FormData();
          body.append('folder', `/${app}`);
          body.append('api_key', `179442986443332`);
          body.append('ocr', 'adv_ocr');
          body.append('signature', signUpload);
          body.append('timestamp', timestamp);
          body.append('file', file.link ? file.link : file);
          return fetch(
            'https://api.cloudinary.com/v1_1/djyenzorc/auto/upload',
            {
              method: 'POST',
              headers: {
                Accept: 'application/json'
              },
              body
            }
          )
            .then(response => response.json())
            .then(res => {
              setUploading(remaining--);
              return onSuccess(res);
            })
            .catch(error => {
              console.log(error);
              setUploading(remaining--);
              return onError(error);
            });
        })
      );
      console.log(values);
      setUploading(0);
    }
  })
);
export default enhance(({ onChange, isUploading }) => (
  <Menu.List title="Hochladen">
    {!!isUploading && (
      <Menu.Item>
        <Progress
          percent={100 / isUploading}
          format={() => ''}
          status="active"
        />
      </Menu.Item>
    )}
    {!isUploading && (
      <Dragger
        multiple
        name="file"
        fileList={[]}
        beforeUpload={() => false}
        onChange={info => {
          onChange(info.fileList);
        }}
      >
        <Menu.Item style={{ textAlign: 'left' }} icon={<FaFile />}>
          Lokale Dateien
        </Menu.Item>
      </Dragger>
    )}
    {!isUploading && (
      <DropboxChooser
        appKey="179442986443332"
        onChange={files =>
          onChange(
            files.map(x => ({
              name: x.link.split('/').pop(),
              link: x.link,
              uid: x.id
            }))
          )
        }
        // onCancel={() => this.onCancel()}
        multiselect
        extensions={[]}
      >
        {({ onClick }) => (
          <Menu.Item
            style={{ textAlign: 'left' }}
            icon={<FaDropbox />}
            onClick={onClick}
          >
            Dropbox
          </Menu.Item>
        )}
      </DropboxChooser>
    )}
  </Menu.List>
));
