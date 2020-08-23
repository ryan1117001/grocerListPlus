import React, { PureComponent } from 'react';
import { ScrollView, Linking, View } from 'react-native';
import { Text, Button } from 'react-native-paper'
import { styles } from './AboutPage.styles'

class AboutPage extends PureComponent {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <ScrollView style={styles.AboutPageWrapper}>
                <View style={styles.ContentWrapper}>
                    <Text style={styles.TextWrapper}>
                        This was made by a single developer, Ryan Hua.
                        If you liked the app, consider buying me a coffee!
                        If not, email me and let me know how it can be improved!
                    </Text>
                    <View style={styles.ButtonRowWrapper}>
                        <Button
                            onPress={() => Linking.openURL('mailto:ryan1117001@gmail.com?subject=Question to the Developer')}
                        >
                            Email
                        </Button>
                        <Button
                            onPress={() => Linking.openURL('https://paypal.me/ryan1117001')}
                        >
                            Donate
                        </Button>
                    </View>
                </View>
            </ScrollView >
        )
    }
}

export default AboutPage;