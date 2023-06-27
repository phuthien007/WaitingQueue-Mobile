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
import BackgroundService from 'react-native-background-actions';
// import BackgroundFetch from 'react-native-background-fetch';
// ('react-native-background-fetch');
// import './bgTask';

let intervalId = -1;

const sleep = (time: any) =>
  // @ts-ignore
  new Promise(resolve => setTimeout(() => resolve(), time));

const veryIntensiveTask = async (taskDataArguments: any) => {
  // Example of an infinite loop task
  const {delay} = taskDataArguments;
  await new Promise(async resolve => {
    for (let i = 0; BackgroundService.isRunning(); i++) {
      // call api
      await fetch('https://api.xephang.online/api/enroll-queues/my-enroll')
        .then(async response => {
          const data = await response.json();
          console.log('vibrate interval');
          for (const item of data) {
            // check if currentQueue + 1 === sequenceNumber
            if (item.currentQueue + 1 === item.sequenceNumber) {
              Vibration.vibrate(1000);
              await BackgroundService.updateNotification({
                taskDesc:
                  'Bạn có hàng đợi sắp đến lượt với số: ' + item.sequenceNumber,
              });
            }
          }
        })
        .catch(error => {
          console.error(error);
        });
      await sleep(delay);
    }
  });
};

const options = {
  taskName: 'QueueApp',
  taskTitle: 'QueueApp',
  taskDesc: 'Hàng đợi của bạn đang được theo dõi',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ff00ff',
  linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
  parameters: {
    delay: 5000,
  },
};

const App = () => {
  const [url, setUrl] = React.useState('https://xephang.online');

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // fetchData();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const startBackgroundService = async () => {
    await BackgroundService.start(veryIntensiveTask, options);
    await BackgroundService.updateNotification({
      taskDesc: 'Queue App đang chạy',
    }); // Only Android, iOS will ignore this call
  };
  const stopBackgroundService = async () => {
    await BackgroundService.stop();
  };

  React.useEffect(() => {
    if (url === 'https://xephang.online/public/home' && intervalId === -1) {
      startBackgroundService();
      intervalId = 1;
    } else {
      console.log('url interval', url);
      stopBackgroundService();
      intervalId = -1;
    }
    return () => {
      stopBackgroundService();
    };
  }, [url]);

  React.useEffect(() => {
    return () => {
      stopBackgroundService();
    };
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
