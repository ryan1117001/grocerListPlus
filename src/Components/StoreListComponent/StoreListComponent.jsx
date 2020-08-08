import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { styles } from './StoreListComponent.styles'
import { List, Surface, IconButton, Provider, Text } from 'react-native-paper';
import {
    db, updateItemsOnUpdateStoreType, updateStoreType, updateStoreArchiveDate
} from '../../Utils/SQLConstants';
import PropTypes from 'prop-types';
import moment from 'moment'
import { storeType, itemType } from '../../Utils/TypeConstants';


class StoreListComponent extends PureComponent {
    constructor(props) {
        super(props)

        // console.debug(props)

        const { store } = props
        this.state = {
            id: store.id,
            storeName: store.storeName,
            storeType: store.storeType,
            dateToGo: moment(store.dateToGo).locale('en-US').format('l'),
            archiveDate: moment(store.archiveDate).locale('en-US').format('l'),
            storeNameText: '',
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.store !== this.props.store) {
            const date = moment(this.props.store.dateToGo).locale('en-US').format('l')
            this.setState({
                id: this.props.store.id,
                storeName: this.props.store.storeName,
                dateToGo: date,
            });
        }
    }

    navigateToStoreItems = () => {
        this.props.navigation.navigate('StoreItems', {
            storeName: this.state.storeName,
            storeId: this.state.id,
            dateToGo: this.state.dateToGo,
        })
    }

    // TODO: when store is updated, items need to move from store to inventory
    updateItemsOnUpdateStoreType = () => {
        var args = []
        if (this.state.storeType === storeType.ARCHIVE) {
            args = [itemType.STORE, this.state.id, itemType.ARCHIVE]
        }
        else if (this.state.storeType === storeType.INUSE) {
            args = [itemType.ARCHIVE, this.state.id, itemType.STORE]
        }
        db.transaction(tx => {
            console.debug('exec updateStoreArchiveDate')
            if (this.state.storeType === storeType.INUSE) {
                var date = moment(new Date()).format('YYYY-MM-DD')
                tx.executeSql(updateStoreArchiveDate, [date, this.state.id])
            }
            console.debug('exec updateItemsOnUpdateStoreType')
            tx.executeSql(updateItemsOnUpdateStoreType, args,
                () => console.debug('success'),
                () => console.debug('error')
            )
        },
            (error) => { console.debug(error) },
            () => {
                console.debug('success')
                this.props.forceRefreshFunction()
            })
    }

    updateStoreType = (args) => {
        db.transaction(tx => {
            tx.executeSql(
                updateStoreType,
                args,
                () => {
                    console.debug('success')
                    this.updateItemsOnUpdateStoreType()
                },
                (error) => { console.debug(error) }
            )
        },
            (error) => console.debug(error),
            () => { this.props.toggleSnackBarFunc(this.state.id) }
        )
    }

    onPressFunction = () => {
        switch (this.state.storeType) {
            case storeType.ARCHIVE:
                console.debug('onPressFunction ARCHIVE')
                this.updateStoreType([storeType.INUSE, this.state.id])
                break
            case storeType.INUSE:
                console.debug('onPressFunction INUSE')
                this.updateStoreType([storeType.ARCHIVE, this.state.id])
                break
            default:
                console.debug('onPressFunction do nothing')
        }
    }

    setDescription = () => {
        switch (this.state.storeType) {
            case storeType.INUSE:
                return <Text>{"Going On: " + this.state.dateToGo}</Text>
            case storeType.ARCHIVE:
                return <Text>{"Archived On: " + this.state.archiveDate}</Text>
            default:
                <Text>Description Error</Text>
                console.debug('Description Error')
        }
    }

    render() {
        return (
            <Provider>
                <View style={styles.StoreListComponentWrapper} >
                    <Surface
                        key={this.state.id}
                        style={styles.Surface}>
                        <List.Item
                            onPress={this.state.storeType === storeType.INUSE ? this.navigateToStoreItems : () => { }}
                            onLongPress={() => this.props.toggleExtraStoreOptionsFunc(this.state.id)}
                            key={this.state.id}
                            title={<Text style={styles.storeTitle}>{this.state.storeName}</Text>}
                            description={this.setDescription}
                            left={() =>
                                <IconButton
                                    icon={this.state.storeType === storeType.ARCHIVE ? 'arrow-left-bold-box-outline' : 'arrow-right-bold-box-outline'}
                                    onPress={this.onPressFunction}
                                />
                            }
                            right={() =>
                                <IconButton
                                    icon='trash-can-outline'
                                    onPress={() => this.props.showDeleteStoreConfirmationFunc(this.state.id)}
                                />
                            }
                        />
                    </Surface>
                </View>
            </Provider>
        )
    }
}

StoreListComponent.propTypes = {
    store: PropTypes.object,
    forceRefreshFunction: PropTypes.func,
    showDeleteStoreConfirmationFunc: PropTypes.func,
    toggleSnackBarFunc: PropTypes.func,
    toggleExtraStoreOptionsFunc: PropTypes.func,
    navigation: PropTypes.object
}

StoreListComponent.defaultProps = {
    store: null,
    forceRefreshFunction: () => { },
    toggleExtraStoreOptionsFunc: () => { },
    navigation: null
}

export default StoreListComponent