import React, { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Img from 'react-image';
import isMobile from 'is-mobile';
import { useKeyPress } from 'ahooks';
import { Chip } from '@mui/material';
import Loading from './Loading';
import * as api from '../utils/api';

const useStyles = makeStyles({
  root: {
    zIndex: 2000,
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgb(255, 255, 255)',
    overflow: 'auto'
  },
  inner: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    minHeight: '100%',
    cursor: 'zoom-out',
    overflow: 'auto',
    flexFlow: 'column'
  },
  image: {
    margin: 'auto',
    '& img': {
      width: '100%',
      boxShadow:
        '0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12)'
    }
  },
  buttons: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    pointerEvents: 'none',
    zIndex: 1
  },
  prev: {
    display: 'flex',
    WebkitBoxPack: 'center',
    justifyContent: 'center',
    position: 'fixed',
    right: 0,
    left: 0,
    width: 'calc(100% - 17px)',
    opacity: 0,
    pointerEvents: 'auto',
    backfaceVisibility: 'hidden',
    top: 0,
    height: '20vh',
    cursor: `url(${require('@images/prev.cur').default}) 9 0, url(${
      require('@images/prev.cur').default
    }), pointer`,
    margin: 0,
    padding: 0,
    background: 'none',
    outline: 'none',
    borderWidth: 'initial',
    borderStyle: 'none',
    borderColor: 'initial',
    borderImage: 'initial'
  },
  next: {
    display: 'flex',
    WebkitBoxPack: 'center',
    justifyContent: 'center',
    position: 'sticky',
    right: 0,
    left: 0,
    width: '100%',
    opacity: 0,
    pointerEvents: 'auto',
    height: '40vh',
    cursor: `url(${require('@images/next.cur').default}) 9 15, url(${
      require('@images/next.cur').default
    }), pointer`,
    top: 'calc(100% - 40vh)',
    margin: 0,
    padding: 0,
    background: 'none',
    outline: 'none',
    borderWidth: 'initial',
    borderStyle: 'none',
    borderColor: 'initial',
    borderImage: 'initial'
  },
  toolbar: {
    position: 'fixed',
    top: 16,
    right: 32,
    zIndex: 1
  },
  toolbarNum: {
    fontWeight: 'bold',
    fontSize: 10,
    color: '#fff',
    background: 'rgba(0, 0, 0, 0.32)'
  }
});

interface ImageBoxProps {
  items: string[];
  index: number;
  onClose: () => void;
}

const ImageBox: React.FC<ImageBoxProps> = props => {
  const classes = useStyles();
  const [index, setIndex] = useState(props.index);

  const onPrev = () =>
    setIndex((index + props.items.length - 1) % props.items.length);
  const onNext = () => setIndex((index + 1) % props.items.length);

  useKeyPress(['up', 'left'], onPrev);
  useKeyPress(['down', 'right'], onNext);

  if (!props.items[index]) {
    return null;
  }

  return (
    <div className={classes.root}>
      <div className={classes.inner} onClick={props.onClose}>
        <div className={classes.image}>
          <Img src={api.proxyImage(props.items[index])} loader={<Loading />} />
        </div>
      </div>
      {!isMobile() && (
        <>
          <div className={classes.buttons}>
            <button className={classes.prev} onClick={onPrev} />
            <button className={classes.next} onClick={onNext} />
          </div>
        </>
      )}
      <div className={classes.toolbar}>
        <Chip
          label={`${index + 1} / ${props.items.length}`}
          className={classes.toolbarNum}
        />
      </div>
    </div>
  );
};

export default ImageBox;
