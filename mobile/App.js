/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState, useContext} from "react";
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  useColorScheme,
  View,
  Dimensions,
  Alert,
  Text
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import { authTokenValidatorHelper, sessionStorageCleanerHelper, authTokenRenewerHelper } from './src/helpers'
import { animateLogoutPromise, changePasswordPromise, getCurrentUserPromise, logoutPromise, removeLoginAnimationsPromise } from './src/promises'
import { LoginPage } from "./src/pages"
import Private from "./src/layouts/Private";

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [ currentUser, setCurrentUser ] = useState({})
  const [ isLoggedIn, setIsLoggedIn ] = useState(false)
  
  const getCurrentUser = async () => {
    const currentU = await getCurrentUserPromise()

    return currentU
  }
  
  useEffect(() => {
    async function init() {
      const isValidAuthToken = await authTokenValidatorHelper()
      console.log('autenticado: '+(isValidAuthToken?'si':'no'))
      if (isValidAuthToken) {
        const currentU = await getCurrentUser()
        const isActivated = currentU.feActivacion !== null

        if(isActivated) {
          setCurrentUser(currentU)
          setIsLoggedIn(true)
        }
      }
    }
    init()
  }, [])

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    padding: 0,
  };

  const {width, height} = Dimensions.get('window');
  const metrics = {
    screenWidth: width < height ? width : height,
    screenHeight: width < height ? height : width,
  };
  
  const handleLogout = async () => {
    await logoutPromise()
    await sessionStorageCleanerHelper()
    //await animateLogoutPromise()

    setIsLoggedIn(false)
    setCurrentUser({})
  }

  const handleLogin = async (currentU) => {
    if (!currentU.error) {
      setCurrentUser(currentU)
      setIsLoggedIn(true)
      //new authTokenRenewerHelper(handleLogout)
      //console.log('b2')
    }
  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView style={backgroundStyle} contentContainerStyle={{height: metrics.screenHeight /*+ StatusBar.currentHeight*/}}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          { isLoggedIn ? 
          <Private currentUser={currentUser} logoutHandler={handleLogout} />
          :
          <LoginPage successHandler={ handleLogin } />
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
