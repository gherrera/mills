import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    ScrollView,
    Alert
} from 'react-native';
import Container from '../../components/Container';
import Lebel from '../../components/Container';

const styles = StyleSheet.create({
    scroll: {
        backgroundColor: '#E1D7D8',
        padding: 30,
        flexDirection: 'column',
    },
})

export default class MainMenu extends Component {

    render() {
        const { currentUser } = this.props

        return (
            <Container>
                <Text>Menu</Text>
            </Container>
        )
    }
}