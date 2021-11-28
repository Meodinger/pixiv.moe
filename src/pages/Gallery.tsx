import React, { useState, useContext, useRef } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useMount } from 'ahooks';
import makeStyles from '@mui/styles/makeStyles';
import {
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Done as DoneIcon,
  Cached as CachedIcon
} from '@mui/icons-material';
import { useIntl } from 'react-intl';
import { useObserver } from 'mobx-react-lite';

import * as config from '../config';

import GalleryList from '../components/GalleryList';
import Loading from '../components/Loading';
// import Refresh from '../components/Refresh';
import Message from '../components/Message';
import SearchInput, {
  SearchOptions,
  SearchInputHandles
} from '../components/SearchInput';

import Storage from '../utils/Storage';
// import * as api from '../utils/api';

import LayoutContainer, {
  LayoutContainerHandles
} from '../containers/LayoutContainer';

import { GalleryContext } from '../stores/GalleryStore';

const useStyles = makeStyles({
  root: {
    margin: '0 auto'
    // paddingLeft: 3,
    // paddingRight: 20
  },
  refreshBtn: {
    textAlign: 'center',
    marginBottom: 10
  }
});

const Gallery: React.FC<{}> = () => {
  const classes = useStyles();
  const intl = useIntl();
  const location = useLocation();
  const history = useHistory();
  const gallery = useContext(GalleryContext);
  const [shouldLogin] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    xRestrict: Storage.get('x_restrict') || false
  });
  const layoutRef = useRef<LayoutContainerHandles>(null);
  const inputRef = useRef<SearchInputHandles>(null);

  const fetchSource = (isFirstLoad: boolean) => {
    if (isFirstLoad) {
      gallery.page = 1;
    }
    gallery.xRestrict = searchOptions.xRestrict;
    gallery.fetchSource();
  };

  const onLoadMore = () => {
    if (gallery.errorTimes < 3) {
      fetchSource(false);
    }
  };

  const refreshContent = () => {
    gallery.clearErrorTimes();
    gallery.clearSource();
    layoutRef?.current?.toTop();
    fetchSource(true);
    // window.location.reload();
  };

  const fetchTags = () => {
    if (gallery.tags.length === 0) {
      gallery.fetchTags();
    }
  };

  const onSearch = (word: string) => {
    if (!word) {
      return;
    }
    if (!isNaN(parseFloat(word)) && isFinite(Number(word))) {
      history.push(`/illust/${word}`);
    } else {
      Storage.set('word', word);
      gallery.clearErrorTimes();
      gallery.clearSource();
      gallery.setWord(word);
      layoutRef?.current?.toTop();
      fetchSource(true);
    }
  };

  const onSearchOptionsChange = (options: SearchOptions) => {
    Storage.set('x_restrict', options.xRestrict);
    setSearchOptions(options);
  };

  const onKeywordClick = (word: string) => {
    gallery.setWord(word);
    if (word !== 'ranking') {
      inputRef.current?.setValue(word);
    } else {
      inputRef.current?.setValue('');
    }
    refreshContent();
    Storage.set('word', word);
  };

  useMount(() => {
    // if (!api.getAuth()) {
    //   setShouldLogin(true);
    //   loginRef.current?.open(() => {
    //     window.location.reload();
    //   });
    //   return;
    // }
    // setShouldLogin(false);

    const word = Storage.get('word');
    if (word && word !== 'ranking') {
      inputRef.current?.setValue(word);
    }

    if (gallery.fromIllust) {
      onSearch(gallery.word);
      gallery.setFromIllust(false);
    } else {
      const search = new URLSearchParams(location.search);
      if (search.get('entry') === 'ranking') {
        gallery.setWord('ranking');
        Storage.set('word', 'ranking');
      } else {
        const cachedWord = Storage.get('word');
        gallery.setWord(cachedWord ? cachedWord : 'ranking');
      }
      if (gallery.items.length === 0) {
        fetchSource(true);
      }
      fetchTags();
    }
  });

  const renderKeywords = () => {
    const keywords = [...gallery.tags];
    keywords.unshift({ tag: 'ranking' });

    if (gallery.isFetchingTags) {
      return <Loading />;
    }

    const word = String(gallery.word);
    let found = false;
    for (const item of keywords) {
      if (item.tag === word) {
        found = true;
        break;
      }
    }

    return (
      <>
        {!found && word !== 'ranking' && word.trim() !== '' && (
          <ListItem button onClick={() => onKeywordClick(word)}>
            <ListItemIcon>
              <DoneIcon style={{ color: '#4caf50' }} />
            </ListItemIcon>
            <ListItemText style={{ fontWeight: 'bold' }} primary={word} />
          </ListItem>
        )}
        {keywords.map(elem => {
          const ranking = elem.tag === 'ranking';
          const highlight =
            elem.tag === gallery.word ||
            (gallery.word === 'ranking' && ranking);

          return (
            <ListItem
              key={elem.tag}
              button
              onClick={() => onKeywordClick(ranking ? 'ranking' : elem.tag)}>
              {highlight && (
                <ListItemIcon>
                  <DoneIcon style={{ color: '#4caf50' }} />
                </ListItemIcon>
              )}
              <ListItemText
                style={{ fontWeight: 'bold' }}
                primary={
                  ranking
                    ? intl.formatMessage({ id: 'Ranking' })
                    : elem.translated_name
                }
              />
            </ListItem>
          );
        })}
      </>
    );
  };

  const onToggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return useObserver(() => (
    <LayoutContainer
      ref={layoutRef}
      title={config.siteTitle}
      menuRender={() => (
        <IconButton
          color="inherit"
          onClick={onToggleDrawer}
          aria-label="Menu"
          size="large">
          <MenuIcon />
        </IconButton>
      )}
      extraRender={() => (
        <SearchInput
          ref={inputRef}
          onSearch={onSearch}
          onOptionsChange={onSearchOptionsChange}
          searchOptions={searchOptions}
        />
      )}
      scroll={{
        infinite: true,
        distance: 200,
        onLoadMore,
        isLoading: gallery.isFetching,
        hasMore: true
      }}>
      {shouldLogin ? (
        <Message
          code={403}
          text={intl.formatMessage({
            id: 'Please sign in to continue'
          })}
        />
      ) : (
        <div className={classes.root}>
          {gallery.items.length === 0 && gallery.isFetching && <Loading />}
          <GalleryList items={gallery.items} />
          {gallery.items.length > 0 && gallery.isFetching && <Loading />}
          {gallery.isError && (
            <>
              <Message
                text={
                  gallery.errorMsg
                    ? gallery.errorMsg
                    : intl.formatMessage({ id: 'Failed to Load' })
                }
              />
              <div className={classes.refreshBtn}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<CachedIcon />}
                  onClick={() => window.location.reload()}>
                  {intl.formatMessage({ id: 'Refresh page' })}
                </Button>
              </div>
            </>
          )}
          {/* <Refresh onClick={refreshContent} /> */}
        </div>
      )}
      <Drawer open={isDrawerOpen} onClose={onToggleDrawer}>
        <div
          tabIndex={0}
          role="button"
          onClick={onToggleDrawer}
          onKeyDown={onToggleDrawer}>
          <List
            subheader={
              <ListSubheader disableSticky>
                {intl.formatMessage({ id: 'Tags' })}
              </ListSubheader>
            }>
            {renderKeywords()}
          </List>
        </div>
      </Drawer>
    </LayoutContainer>
  ));
};

export default Gallery;
