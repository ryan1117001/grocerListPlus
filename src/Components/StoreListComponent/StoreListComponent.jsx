import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { styles } from './StoreListComponent.styles'
import { List, Surface, IconButton, Provider, Text } from 'react-native-paper';
import {
    db, updateItemsOnUpdateStoreType, updateStoreType, updateStoreArchiveDate
} from '../../Utils/SQLConstants';
import PropTypes from 'prop-types';
import { storeType, itemType } from '../../Utils/TypeConstants';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat'

class StoreListComponent extends PureComponent {
    constructor(props) {
        super(props)

        dayjs.extend(localizedFormat)
        // console.debug(props)
        const { store } = props
        this.state = {
            storeId: store.storeId,
            storeName: store.storeName,
            storeType: store.storeType,
            dateToGo: dayjs(store.dateToGo).format('L'),
            archiveDate: dayjs(store.archiveDate).format('L'),
            storeNameText: '',
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.store !== this.props.store) {
            const date = dayjs(this.props.store.dateToGo).format('L')
            this.setState({
                storeId: this.props.store.storeId,
                storeName: this.props.store.storeName,
                dateToGo: date,
            });
        }
    }

    navigateToStoreItems = () => {
        switch (this.state.storeType) {
            case storeType.INUSE:
                this.props.navigation.navigate('StoreItems', {
                    storeName: this.state.storeName,
                    storeId: this.state.storeId,
                    dateToGo: this.state.dateToGo,
                })
                break;
            case storeType.ARCHIVE:
                this.props.navigation.navigate('ArchiveStoreItems', {
                    storeName: this.state.storeName,
                    storeId: this.state.storeId,
                    dateToGo: this.state.dateToGo,
                })
                break;
            default:
                break;
        }
    }

    updateItemsOnUpdateStoreType = () => {
        var args = []
        if (this.state.storeType === storeType.ARCHIVE) {
            args = [itemType.STORE, this.state.storeId, itemType.ARCHIVE]
        }
        else if (this.state.storeType === storeType.INUSE) {
            args = [itemType.ARCHIVE, this.state.storeId, itemType.STORE]
        }
        db.transaction(tx => {
            console.debug('exec updateStoreArchiveDate')
            if (this.state.storeType === storeType.INUSE) {
                var date = dayjs().format('YYYY-MM-DD')
                tx.executeSql(updateStoreArchiveDate, [date, this.state.storeId])
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
            () => { this.props.toggleSnackBarFunc(this.state.storeId) }
        )
    }

    onPressFunction = () => {
        switch (this.state.storeType) {
            case storeType.ARCHIVE:
                console.debug('onPressFunction ARCHIVE')
                this.updateStoreType([storeType.INUSE, this.state.storeId])
                break
            case storeType.INUSE:
                console.debug('onPressFunction INUSE')
                this.updateStoreType([storeType.ARCHIVE, this.state.storeId])
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
                        key={this.state.storeId}
                        style={styles.Surface}>
                        <List.Item
                            onPress={this.navigateToStoreItems}
                            onLongPress={() => this.props.toggleExtraStoreOptionsFunc(this.state.storeId)}
                            key={this.state.storeId}
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
                                    onPress={() => this.props.showDeleteStoreConfirmationFunc(this.state.storeId)}
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