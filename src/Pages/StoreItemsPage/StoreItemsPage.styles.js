import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    StoreItemsPageWrapper: {
        flex: 1,
    },
    CalendarWrapper: {
        height: 330
    },
    TitleRowWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    UserInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        margin: 16
    },
});