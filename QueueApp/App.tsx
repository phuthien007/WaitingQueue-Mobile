/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import {
  SafeAreaView,
  Vibration,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import WebView from 'react-native-webview';
import BackgroundTimer from 'react-native-background-timer';
// import BackgroundFetch from 'react-native-background-fetch';
// ('react-native-background-fetch');

let intervalId = -1;

const App = () => {
  const [url, setUrl] = React.useState('https://xephang.online');

  const fetchData = async () => {
    const response = await fetch(
      'https://api.xephang.online/api/enroll-queues/my-enroll',
    );
    const data = await response.json();
    for (const item of data) {
      if (
        item.currentQueue + 1 === item.sequenceNumber &&
        item.status === 'pending'
      ) {
        console.log('vibrate');
        // BackgroundFetch.start();
        Vibration.vibrate(3000);
      }
    }
  };

  React.useEffect(() => {
    if (url.endsWith('/public/home') && intervalId === -1) {
      intervalId = BackgroundTimer.setInterval(async () => {
        fetchData();
      }, 5000);
    }
    if (!url.endsWith('/public/home') && intervalId !== -1) {
      BackgroundTimer.clearInterval(intervalId);
      intervalId = -1;
    }

    return () => {
      BackgroundTimer.clearInterval(intervalId);
    };
  }, [url]);
  React.useEffect(() => {
    return () => {
      BackgroundTimer.clearInterval(intervalId);
    };
  }, []);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView
        contentContainerStyle={{flex: 1, backgroundColor: '#fff'}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {!refreshing && (
          <WebView
            source={{uri: url}}
            onNavigationStateChange={e => setUrl(e.url)}
            style={{flex: 1}}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
