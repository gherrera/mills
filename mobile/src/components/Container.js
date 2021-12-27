import React, { Component } from 'react';
 
import {
  StyleSheet,
  View
} from 'react-native';
 
const Container = (props) => {
    return (
        <View style={props.styles?props.styles : styles.labelContainer}>
            { props.children }
        </View>
    );
}
 
const styles = StyleSheet.create({
    labelContainer: {
        padding: 2
    }
});
 
export default Container;