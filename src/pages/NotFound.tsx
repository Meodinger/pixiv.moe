import React from 'react';
import { useIntl } from 'react-intl';
import Message from '../components/Message';

const NotFound: React.FC<{}> = () => {
  const intl = useIntl();

  return (
    <Message
      code={404}
      text={intl.formatMessage({
        id:
          'An error occurred. Check the URL or wait for a while and access again.'
      })}
    />
  );
};

export default NotFound;
