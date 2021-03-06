const { Telegram } = require( 'telegraf' );
const { getUsers } = require( "./users.js" );
const { getHomework, getSavedHomework, homeworkComparator, getHtml, saveHomeworks } = require( "./homework.js" );

const bot = new Telegram( process.env.TOKEN );

const notify = ( message, userId ) => {
    try {
        if ( userId !== undefined ) {
            const users = getUsers();
            console.log( users );
            for ( const { id } of users ) {
                bot.sendMessage( id, message );
            }
        } else {
            bot.sendMessage( userId, message );
        }
    } catch ( err ) {
        console.log( err );
    }
}

module.exports = async ( userId, isSendAll = false ) => {
    const html = await getHtml( process.env.URL );
    const newHw = await getHomework( html );
    const oldHw = isSendAll ? [] : getSavedHomework();

    console.log( "Checking" );

    if ( !homeworkComparator( newHw, oldHw ) ) {
        let message = "Появилось новое дз: \n";

        if ( newHw.length > oldHw.length ) {
            for ( const hw of newHw ) {
                if ( oldHw.find( ( { title } ) => title === hw.title ) === undefined ) {
                    message += `${hw.title}\n ${hw.href}\n\n`;
                }
            }

            if ( message.trim() !== "" ) {
                saveHomeworks( newHw );
                notify( message, userId );
            }
        }
    }
}