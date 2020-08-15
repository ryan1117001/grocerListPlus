import React, { PureComponent } from 'react';
import { ScrollView, Linking } from 'react-native';
import { Text, Button } from 'react-native-paper'

class AboutPage extends PureComponent {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <ScrollView>
                <Text>
                    This was made by a single developer, Ryan Hua.
                    Consider donating to the developer as well
                </Text>
                <Button
                    onPress={() => Linking.openURL('mailto:ryan1117001@gmail.com?subject=Question to the Develpoer')}
                >
                    Email
                </Button>
                <Button
                    onPress={() => Linking.openURL('https://paypal.me/ryan1117001')}
                >
                    Donate
                </Button>
            </ScrollView >
        )
    }
}

export default AboutPage;