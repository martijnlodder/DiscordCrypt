//META{"name":"discordCrypt"}*//

/*******************************************************************************
 * MIT License
 *
 * Copyright (c) 2018 Leonardo Gates
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 ******************************************************************************/

"use strict";

/**
 * @public
 * @desc Main plugin prototype.
 */
class discordCrypt {

    /* ============================================================== */

    /**
     * @typedef {Object} CachedModules
     * @desc Cached React and Discord modules for internal access.
     * @property {Object} MessageParser Internal message parser that's used to translate tags to Discord symbols.
     * @property {Object} MessageController Internal message controller used to receive, send and delete messages.
     * @property {Object} MessageActionTypes Internal message action types and constants for events.
     * @property {Object} MessageDispatcher Internal message dispatcher for pending queued messages.
     * @property {Object} MessageQueue Internal message Queue store for pending parsing.
     * @property {Object} UserResolver Internal user resolver for retrieving all users known.
     * @property {Object} GuildResolver Internal Guild resolver for retrieving a list of all guilds currently in.
     * @property {Object} ChannelResolver Internal channel resolver for retrieving a list of all channels available.
     * @property {Object} HighlightJS Internal code based library responsible for highlighting code blocks.
     */

    /**
     * @typedef {Object} ReactModules
     * @desc Contains all React and Discord modules including the channel's properties for internal access.
     * @property {Object} ChannelProps Retrieved channel properties object for the current channel.
     * @property {Object} MessageParser Internal message parser that's used to translate tags to Discord symbols.
     * @property {Object} MessageController Internal message controller used to receive, send and delete messages.
     * @property {Object} MessageActionTypes Internal message action types and constants for events.
     * @property {Object} MessageDispatcher Internal message dispatcher for pending queued messages.
     * @property {Object} MessageQueue Internal message Queue store for pending parsing.
     * @property {Object} UserResolver Internal user resolver for retrieving all users known.
     * @property {Object} GuildResolver Internal Guild resolver for retrieving a list of all guilds currently in.
     * @property {Object} ChannelResolver Internal channel resolver for retrieving a list of all channels available.
     * @property {Object} HighlightJS Internal code based library responsible for highlighting code blocks.
     */

    /**
     * @typedef {Object} TimedMessage
     * @desc Contains a timed message pending deletion.
     * @property {string} messageId The identification tag of the timed message.
     * @property {string} channelId The channel's identifier that this message was sent to.
     * @property {Date} expireTime The time to purge the message from the channel.
     */

    /**
     * @typedef {Object} ChannelPassword
     * @desc Contains the primary and secondary keys used to encrypt or decrypt messages in a channel.
     * @property {string} primary The primary key used for the inner cipher.
     * @property {string} secondary The secondary key used for the outer cipher.
     */

    /**
     * @typedef {Object} PublicKeyInfo
     * @desc Contains information given an input public key.
     * @property {string} fingerprint The SHA-256 sum of the public key.
     * @property {string} algorithm The public key's type ( DH | ECDH ) extracted from the metadata.
     * @property {int} bit_length The length, in bits, of the public key's security.
     */

    /**
     * @typedef {Object} Config
     * @desc Contains the configuration data used for the plugin.
     * @property {string} version The version of the configuration.
     * @property {string} defaultPassword The default key to encrypt or decrypt message with,
     *      if not specifically defined.
     * @property {string} encodeMessageTrigger The suffix trigger which, once appended to the message,
     *      forces encryption even if a key is not specifically defined for this channel.
     * @property {number} encryptScanDelay If using timed scanning events in case hooked events fail,
     *      this denotes how often, in milliseconds, to scan the window for new messages and decrypt them.
     * @property {number} encryptMode The index of the ciphers to use for message encryption.
     * @property {string} encryptBlockMode The block operation mode of the ciphers used to encrypt message.
     * @property {boolean} encodeAll If enabled, automatically forces all messages sent to be encrypted if a
     *      ChannelPassword object is defined for the current channel..
     * @property {string} paddingMode The short-hand padding scheme to used to align all messages to the cipher's
     *      block length.
     * @property {{channelId: string, password: ChannelPassword}} passList Storage containing all channels with
     *      passwords defined for encryption of new messages and decryption of currently encrypted messages.
     * @property {string} up1Host The full URI host of the Up1 service to use for encrypted file uploads.
     * @property {string} up1ApiKey If specified, contains the API key used for authentication with the up1Host.
     * @property {Array<TimedMessage>} timedMessages Contains all logged timed messages pending deletion.
     */

    /**
     * @typedef {Object} UpdateCallback
     * @desc The function to execute after an update has been retrieved.
     * @property {string} file_data The update file's data.
     * @property {string} short_hash A 64-bit SHA-256 checksum of the new update.
     * @property {string} new_version The new version of the update.
     * @property {string} full_changelog The full changelog.
     */

    /**
     * @typedef {Object} ModulePredicate
     * @desc Predicate for searching module.
     * @property {*} module Module to test.
     * @return {boolean} Returns `true` if `module` matches predicate.
     */

    /**
     * @typedef {Object} GetResultCallback
     * @desc The function to execute at the end of a GET request containing the result or error that occurred.
     * @property {int} statusCode The HTTP static code of the operation.
     * @property {string|null} The HTTP error string if an error occurred.
     * @property {string} data The returned data from the request.
     */

    /**
     * @typedef {Object} CodeBlockDescriptor
     * @desc Indicates the values present in a markdown-styled code block.
     * @property {int} start_pos The starting position of the code block.
     * @property {int} end_pos The ending position of the code block.
     * @property {string} language The language identifier of the code within this block.
     * @property {string} raw_code The raw code within the code block.
     * @property {string} captured_block The entire markdown formatted code block.
     */

    /**
     * @typedef {Object} PBKDF2Callback
     * @desc The function to execute after an async request for PBKDF2 is completed containing the result or error.
     * @property {string} error The error that occurred during processing or null on success.
     * @property {string} hash The hash either as a hex or Base64 encoded string ( or null on failure ).
     */

    /**
     * @typedef {Object} EncryptedFileCallback
     * @desc The function to execute when a file has finished being encrypted.
     * @property {string} error_string The error that occurred during operation or null if no error occurred.
     * @property {Buffer} encrypted_data The resulting encrypted buffer as a Buffer() object.
     * @property {string} identity The encoded identity of the encrypted file.
     * @property {string} seed The initial seed used to decrypt the encryption keys of the file.
     */

    /**
     * @typedef {Object} UploadedFileCallback
     * @desc The function to execute after a file has been uploaded to an Up1 service.
     * @property {string} error_string The error that occurred or null if no error occurred.
     * @property {string} file_url The URL of the uploaded file/
     * @property {string} deletion_link The link used to delete the file.
     * @property {string} encoded_seed The encoded encryption key used to decrypt the file.
     */

    /**
     * @typedef {Object} ScryptCallback
     * @desc The function to execute for Scrypt based status updates.
     *      The function must return false repeatedly upon each call to have Scrypt continue running.
     *      Once [progress] === 1.f AND [key] is defined, no further calls will be made.
     * @property {string} error The error message encountered or null.
     * @property {real} progress The percentage of the operation completed. This ranges from [ 0.00 - 1.00 ].
     * @property {Buffer} result The output result when completed or null if not completed.
     * @returns {boolean} Returns false if the operation is to continue running or true if the cancel the running
     *      operation.
     */

    /**
     * @typedef {Object} HashCallback
     * @desc The function to execute once the hash is calculated or an error has occurred.
     * @property {string} error The error that occurred or null.
     * @property {string} hash The hex or Base64 encoded result.
     */

    /**
     * @typedef {Object} ClipboardInfo
     * @desc Contains extracted data from the current clipboard.
     * @property {string} mime_type The MIME type of the extracted data.
     * @property {string|null} name The name of the file, if a file was contained in the clipboard.
     * @property {Buffer|null} data The raw data contained in the clipboard as a Buffer.
     */

    /**
     * @typedef {Object} ProcessedMessage
     * @desc Contains a processed message with additional data.
     * @property {boolean} url Whether the message has any parsed URLs within it.
     * @property {boolean} code Whether the message has any parsed code blocks within it.
     * @property {string} html The raw message's HTML.
     */

    /**
     * @typedef {Object} UserTags
     * @desc Extracted user tagging information from an input message.
     * @property {string} processed_message The processed message containing user tags with the discriminator removed.
     * @property {Array<string>} user_tags All extracted user tags from the message.
     */

    /**
     * @typedef {Object} URLInfo
     * @desc Contains information of a message containing any URLs.
     * @property {boolean} url Whether the input message contained any parsed URLs.
     * @property {string} html The raw formatted HTML containing any parsed URLs.
     */

    /**
     * @typedef {Object} CodeBlockInfo
     * @desc Contains information of a message containing code blocks.
     * @property {boolean} code Whether the input message contained any parsed code blocks.
     * @property {string} html The raw formatted HTML containing any parsed code blocks.
     */

    /**
     * @typedef {Object} LibraryInfo
     * @desc Contains the library and necessary information.
     * @property {boolean} requiresElectron Whether this library relies on Electron's internal support.
     * @property {boolean} requiresBrowser Whether this library is meant to be run in a browser.
     * @property {string} code The raw code for execution defined in the library.
     */

    /**
     * @typedef {Object} LibraryDefinition
     * @desc Contains a definition of a raw library executed upon plugin startup.
     * @property {string} name The name of the library file.
     * @property {LibraryInfo} info The library info.
     */

    /* ============================================================== */

    /**
     * @public
     * @desc Returns the name of the plugin.
     * @returns {string}
     */
    getName() {
        return 'DiscordCrypt';
    }

    /**
     * @public
     * @desc Returns the description of the plugin.
     * @returns {string}
     */
    getDescription() {
        return 'Provides secure messaging for Discord using various cryptography standards.';
    }

    /**
     * @public
     * @desc Returns the plugin's original author.
     * @returns {string}
     */
    getAuthor() {
        return 'Leonardo Gates';
    }

    /**
     * @public
     * @desc Returns the current version of the plugin.
     * @returns {string}
     */
    getVersion() {
        return '1.2.5';
    }

    /* ============================================================== */

    /**
     * @public
     * @desc Initializes an instance of DiscordCrypt.
     * @example
     * let instance = new discordCrypt();
     */
    constructor() {

        /* ============================================ */

        /**
         * Discord class names that changes ever so often because they're douches.
         * These will usually be the culprit if the plugin breaks.
         */

        /**
         * @desc Used to scan each message for an embedded descriptor.
         * @type {string}
         */
        this.messageMarkupClass = '.markup';
        /**
         * @desc Used to find the search toolbar to inject all option buttons.
         * @type {string}
         */
        this.searchUiClass = '.search .search-bar';
        /**
         * @desc Used to hook messages being sent.
         * @type {string}
         */
        this.channelTextAreaClass = '.content textarea';
        /**
         * @desc Used to detect if the autocomplete dialog is opened.
         * @type {string}
         */
        this.autoCompleteClass = '.autocomplete-1vrmpx';

        /* ============================================ */

        /**
         * @desc Defines what an encrypted message starts with. Must be 4x UTF-16 bytes.
         * @type {string}
         */
        this.encodedMessageHeader = "⢷⢸⢹⢺";

        /**
         * @desc Defines what a public key message starts with. Must be 4x UTF-16 bytes.
         * @type {string}
         */
        this.encodedKeyHeader = "⢻⢼⢽⢾";

        /**
         * @desc Defines what the header of an encrypted message says.
         * @type {string}
         */
        this.messageHeader = '-----ENCRYPTED MESSAGE-----';

        /**
         * @desc Master database password. This is a Buffer() containing a 256-bit key.
         * @type {Buffer|null}
         */
        this.masterPassword = null;

        /**
         * @desc Message scanning interval handler's index. Used to stop any running handler.
         *      Defined only if hooking of modules failed.
         * @type {int}
         */
        this.scanInterval = undefined;

        /**
         * @desc The index of the handler used to reload the toolbar.
         *      Defined only if hooking of modules failed.
         * @type {int}
         */
        this.toolbarReloadInterval = undefined;

        /**
         * @desc The index of the handler used for automatic update checking.
         * @type {int}
         */
        this.updateHandlerInterval = undefined;

        /**
         * @desc The index of the handler used for timed message deletion.
         * @type {int}
         */
        this.timedMessageInterval = undefined;

        /**
         * @desc The main message update event dispatcher used by Discord. Resolved upon startup.
         * @type {Object|null}
         */
        this.messageUpdateDispatcher = null;

        /**
         * @desc The configuration file currently in use. Only valid after decryption of the configuration database.
         * @type {Config|null}
         */
        this.configFile = null;

        /**
         * @desc Used to cache webpack modules.
         * @type {CachedModules} Object containing cached modules
         */
        this.cachedModules = {};

        /**
         * @desc Indexes of each dual-symmetric encryption mode.
         * @type {int[]}
         */
        this.encryptModes = [
            /* Blowfish(Blowfish, AES, Camellia, IDEA, TripleDES) */
            0, 1, 2, 3, 4,
            /* AES(Blowfish, AES, Camellia, IDEA, TripleDES) */
            5, 6, 7, 8, 9,
            /* Camellia(Blowfish, AES, Camellia, IDEA, TripleDES) */
            10, 11, 12, 13, 14,
            /* IDEA(Blowfish, AES, Camellia, IDEA, TripleDES) */
            15, 16, 17, 18, 19,
            /* TripleDES(Blowfish, AES, Camellia, IDEA, TripleDES) */
            20, 21, 22, 23, 24
        ];

        /**
         * @desc Symmetric block modes of operation.
         * @type {string[]}
         */
        this.encryptBlockModes = [
            'CBC', /* Cipher Block-Chaining */
            'CFB', /* Cipher Feedback Mode */
            'OFB', /* Output Feedback Mode */
        ];

        /**
         * @desc Shorthand padding modes for block ciphers referred to in the code.
         * @type {string[]}
         */
        this.paddingModes = [
            'PKC7', /* PKCS #7 */
            'ANS2', /* ANSI X.923 */
            'ISO1', /* ISO-10126 */
            'ISO9', /* ISO-97972 */
        ];

        /**
         * @desc Defines the CSS for the application overlays.
         * @type {string}
         */
        this.appCss =
            `a#inbrowserbtn.btn{ display: none }.dc-overlay { position: fixed; font-family: monospace; display: none; width: 100%; height: 100%; left: 0; bottom: 0; right: 0; top: 0; z-index: 1000; cursor: default; transform: translateZ(0px); background: rgba(0, 0, 0, 0.85) !important;}.dc-scroll-table { margin-top: 20px; overflow: auto; height: 50%;}.dc-table { border: 1px solid lightgrey; padding: 5px; width: 100%;}.dc-table > thead { background: #d3d3d3; color: #000;}.dc-table > thead > tr > th { padding: 4px;}.dc-table > tbody > tr > td { text-align: center; padding: 2px;}.dc-table > tbody > tr > td > button { display: block; margin: auto;}.dc-password-field { width: 95%; margin: 10px; color: #ffffff; height: 10px; padding: 5px; background-color: #000000; border: 2px solid #3a71c1;}.dc-overlay-centerfield { position: absolute; top: 35%; left: 50%; font-size: 20px; color: #ffffff; padding: 16px; border-radius: 20px; background: rgba(0, 0, 0, 0.7); transform: translate(-50%, 50%);}.dc-overlay-main { overflow: hidden; position: absolute; left: 5%; right: 5%; top: 5%; bottom: 5%; width: 90%; height: 90%; border: 3px solid #3f3f3f; border-radius: 3px;}.dc-textarea { font-family: monospace; font-size: 12px; color: #ffffff; background: #000; overflow: auto; padding: 5px; resize: none; height: 100%; width: 100%; margin: 2px;}.dc-update-field { font-size: 14px; margin: 10px;}ul.dc-list { margin: 10px; padding: 5px; list-style-type: circle;}ul.dc-list > li { padding: 5px; }ul.dc-list-red { color: #ff0000; }.dc-overlay-main textarea { background: transparent !important; cursor: default; font-size: 12px; padding: 5px; margin-top: 10px; border-radius: 2px; resize: none; color: #8e8e8e; width: 70%; overflow-y: hidden; user-select: none;}.dc-overlay-main select { background-color: transparent; border-radius: 3px; font-size: 12px; color: #fff;}.dc-overlay-main select:hover { background-color: #000 !important; color: #fff;}.dc-input-field { font-family: monospace !important; background: #000 !important; color: #fff !important; font-size: 12px; width: 50%; margin-bottom: 10px; margin-top: -5px; margin-left: 10%;}.dc-input-label { font-family: monospace !important; color: #708090; min-width: 20%;}.dc-ruler-align { display: flex; margin: 10px;}.dc-code-block { font-family: monospace !important; font-size: 0.875rem; line-height: 1rem; overflow-x: visible; text-indent: 0; background: rgba(0,0,0,0.42)!important; color: hsla(0,0%,100%,0.7)!important; padding: 6px!important; position: relative;}.dc-overlay-main .tab { overflow: hidden; background-color: rgba(0, 0, 0, .9) !important; border-bottom: 3px solid #3f3f3f;}.dc-overlay-main .tab button { color: #008000; background-color: inherit; cursor: pointer; padding: 14px 14px; font-size: 14px; transition: 0.5s; font-family: monospace; border-radius: 3px; margin: 3px;}.dc-overlay-main .tab button:hover { background-color: #515c6b;}.dc-overlay-main .tab button.active { background-color: #1f1f2b;}.dc-overlay-main .tab-content { display: none; height: 95%; color: #9298a2; overflow: auto; padding: 10px 25px 5px; animation: fadeEffect 1s; background: rgba(0, 0, 0, 0.7) !important;}.dc-hint { font-size: 9px; display: block;}.dc-hint > p { margin: 0 0 0 30%;}.dc-svg { color: #fff; opacity: .6; margin: 0 4px; cursor: pointer; width: 24px; height: 24px;}.dc-svg:hover { color: #fff; opacity: .8;}.dc-button{ margin-right: 5px; margin-left: 5px; background-color: #7289da; color: #fff; align-items: center; border-radius: 3px; box-sizing: border-box; display: flex; font-size: 14px; width: auto; height: 32px; min-height: 32px; min-width: 60px; font-weight: 500; justify-content: center; line-height: 16px; padding: 2px 16px; position: relative; user-select: none;}.dc-button-small{ height: 20px !important; min-height: 20px !important; font-size: 10px;}.dc-button:hover{ background-color: #677bc4 !important; }.dc-button:active{ background-color: #5b6eae !important; }.dc-button-inverse{ color: #f04747; background: transparent !important; border: 1px solid rgba(240,71,71,.3); transition: color .17s ease,background-color .17s ease,border-color .17s ease;}.dc-button-inverse:hover{ border-color: rgba(240,71,71,.6); background: transparent !important;}.dc-button-inverse:active{ background-color: rgba(240,71,71,.1); }.stat-levels { box-shadow: inset 0 0 25px rgba(0,0,0,.5); margin: 5px auto 0 auto; height: 20px; padding: 15px; border: 1px solid #494a4e; border-radius: 10px; background: linear-gradient(#444549 0%, #343539 100%);}.stat-bar { background-color: #2a2b2f; box-shadow: inset 0 5px 15px rgba(0,0,0,.6); height: 8px; overflow: hidden; padding: 3px; border-radius: 3px; margin-bottom: 10px; margin-top: 10px; margin-left: 0;}.stat-bar-rating { border-radius: 4px; float: left; height: 100%; font-size: 12px; color: #ffffff; text-align: center; text-indent: -9999px; background-color: #3a71c1; box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.15);}.stat-bar-rating { @include stat-bar(#cf3a02, #ff4500, top, bottom); }`;

        /**
         * @desc Contains the raw HTML used to inject into the search descriptor providing menu icons.
         * @type {string}
         */
        this.toolbarHtml =
            `<button type="button" id="dc-clipboard-upload-btn" style="background-color: transparent;" title="Upload Encrypted Clipboard"> <svg x="0px" y="0px" width="30" height="30" viewBox="0 0 18 18" class="dc-svg">  <path fill="lightgrey" d="M13 4h-3v-4h-10v14h6v2h10v-9l-3-3zM3 1h4v1h-4v-1zM15   15h-8v-10h5v3h3v7zM13 7v-2l2 2h-2z"/> </svg></button><button type="button" id="dc-file-btn" style="background-color: transparent;" title="Upload Encrypted File"> <svg class="dc-svg" width="24" height="24" viewBox="0 0 1792 1792" fill="lightgrey">  <path d="M768 384v-128h-128v128h128zm128 128v-128h-128v128h128zm-128   128v-128h-128v128h128zm128 128v-128h-128v128h128zm700-388q28 28 48   76t20 88v1152q0 40-28 68t-68 28h-1344q-40 0-68-28t-28-68v-1600q0-40 28-68t68-28h896q40   0 88 20t76 48zm-444-244v376h376q-10-29-22-41l-313-313q-12-12-41-22zm384 1528v-1024h-416q-40   0-68-28t-28-68v-416h-128v128h-128v-128h-512v1536h1280zm-627-721l107 349q8 27 8 52 0 83-72.5   137.5t-183.5 54.5-183.5-54.5-72.5-137.5q0-25 8-52 21-63 120-396v-128h128v128h79q22 0 39   13t23 34zm-141 465q53 0 90.5-19t37.5-45-37.5-45-90.5-19-90.5 19-37.5 45 37.5 45 90.5 19z">  </path> </svg></button><button type="button" id="dc-settings-btn" style="background-color: transparent;" title="DiscordCrypt Settings"> <svg class="dc-svg" enable-background="new 0 0 32 32" version="1.1" viewBox="0 0 32 32"  width="20px" height="20px" xml:space="preserve">  <g>   <path fill="lightgrey" d="M28,10H18v2h10V10z M14,10H4v10h10V10z M32,0H0v28h15.518c1.614,2.411,    4.361,3.999,7.482,4c4.971-0.002,8.998-4.029,9-9    c0-0.362-0.027-0.718-0.069-1.069L32,22V0z M10,2h12v2H10V2z M6,2h2v2H6V2z M2,2h2v2H2V2z    M23,29.883    c-3.801-0.009-6.876-3.084-6.885-6.883c0.009-3.801,3.084-6.876,6.885-6.885c3.799,0.009,6.874,    3.084,6.883,6.885    C29.874,26.799,26.799,29.874,23,29.883z M29.999,    17.348c-0.57-0.706-1.243-1.324-1.999-1.83V14h-4.99c-0.003,0-0.007,0-0.01,0    s-0.007,0-0.01,0H18v1.516c-2.412,1.614-4,4.361-4,7.483c0,1.054,0.19,2.061,0.523,    3H2V6h27.999V17.348z M30,4h-4V2h4V4z"/>   <path fill="lightgrey" d="M28,    24v-2.001h-1.663c-0.063-0.212-0.145-0.413-0.245-0.606l1.187-1.187l-1.416-1.415l-1.165,1.166    c-0.22-0.123-0.452-0.221-0.697-0.294V18h-2v1.662c-0.229,0.068-0.446,0.158-0.652,    0.27l-1.141-1.14l-1.415,1.415l1.14,1.14    c-0.112,0.207-0.202,0.424-0.271,0.653H18v2h1.662c0.073,0.246,0.172,0.479,    0.295,0.698l-1.165,1.163l1.413,1.416l1.188-1.187    c0.192,0.101,0.394,0.182,0.605,0.245V28H24v-1.665c0.229-0.068,0.445-0.158,    0.651-0.27l1.212,1.212l1.414-1.416l-1.212-1.21    c0.111-0.206,0.201-0.423,0.27-0.651H28z M22.999,    24.499c-0.829-0.002-1.498-0.671-1.501-1.5c0.003-0.829,0.672-1.498,1.501-1.501    c0.829,0.003,1.498,0.672,1.5,1.501C24.497,23.828,23.828,24.497,22.999,24.499z"/>  </g> </svg></button><button type="button" id="dc-lock-btn" style="background-color: transparent;"/><button type="button" id="dc-passwd-btn" style="background-color: transparent;" title="Password Settings"> <svg class="dc-svg" version="1.1" viewBox="0 0 32 32" width="20px" height="20px">  <g fill="none" fill-rule="evenodd" stroke="none" stroke-width="1">   <g fill="lightgrey">    <path d="M13.008518,22 L11.508518,23.5 L11.508518,23.5 L14.008518,26 L11.008518,     29 L8.50851798,26.5 L6.63305475,28.3754632 C5.79169774,29.2168202     4.42905085,29.2205817 3.5909158,28.3824466 L3.62607133,28.4176022 C2.78924,27.5807709     2.79106286,26.2174551 3.63305475,25.3754632 L15.7904495,13.2180685     C15.2908061,12.2545997 15.008518,11.1602658 15.008518,10 C15.008518,6.13400656 18.1425245,     3 22.008518,3 C25.8745114,3     29.008518,6.13400656 29.008518,10 C29.008518,13.8659934 25.8745114,17 22.008518,     17 C20.8482521,17 19.7539183,16.7177118 18.7904495,16.2180685     L18.7904495,16.2180685 L16.008518,19 L18.008518,21 L15.008518,24 L13.008518,22 L13.008518,     22 L13.008518,22 Z M22.008518,14 C24.2176571,14     26.008518,12.2091391 26.008518,10 C26.008518,7.79086089 24.2176571,6 22.008518,     6 C19.7993789,6 18.008518,7.79086089 18.008518,10 C18.008518,12.2091391     19.7993789,14 22.008518,14 L22.008518,14 Z" id="key"/>   </g>  </g> </svg></button><button type="button" id="dc-exchange-btn" style="background-color: transparent;" title="Key Exchange Menu"> <svg class="dc-svg" version="1.1" viewBox="0 0 78 78" width="20px" height="20px">  <path d="M72,4.5H6c-3.299,0-6,2.699-6,6V55.5c0,3.301,2.701,6,6,6h66c3.301,0,6-2.699,6-6V10.5   C78,7.2,75.301,4.5,72,4.5z M72,50.5H6V10.5h66V50.5z   M52.5,67.5h-27c-1.66,0-3,1.341-3,3v3h33v-3C55.5,68.84,54.16,67.5,52.5,67.5z   M26.991,36.5H36v-12h-9.009v-6.729L15.264,30.5l11.728,12.728V36.5z   M50.836,43.228L62.563,30.5L50.836,17.771V24.5h-9.009v12  h9.009V43.228z" style="fill:#d3d3d3;"/> </svg></button><button type="button" id="dc-quick-exchange-btn" style="background-color: transparent;"  title="Generate & Send New Public Key"> <svg class="dc-svg iconActive-AKd_jq icon-1R19_H iconMargin-2YXk4F"   x="0px" y="0px" viewBox="0 0 58 58" width="20px" height="20px">  <path style="fill:#d3d3d3;"     d="M27.767,26.73c-2.428-2.291-3.766-5.392-3.766-8.729c0-6.617,5.383-12,12-12s12,5.383,12,12   c0,3.288-1.372,6.469-3.765,8.728l-1.373-1.455c2.023-1.909,   3.138-4.492,3.138-7.272c0-5.514-4.486-10-10-10s-10,4.486-10,10   c0,2.781,1.114,5.365,3.139,7.274L27.767,26.73z"/>  <path style="fill:#d3d3d3;"     d="M56.428,38.815c-0.937-0.695-2.188-0.896-3.435-0.55l-15.29,4.227   C37.891,42.028,38,41.522,38,   40.991c0-2.2-1.794-3.991-3.999-3.991h-9.377c-0.667-1-2.363-4-4.623-4H16v-0.999   C16,30.347,14.654,29,13,29H9c-1.654,0-3,1.347-3,3v17C6,50.655,7.346,52,9,52h4c1.654,0,   3-1.345,3-2.999v-0.753l12.14,8.201   c1.524,1.031,3.297,1.55,5.075,1.55c1.641,0,3.286-0.441,4.742-1.33l18.172-11.101C57.283,   44.864,58,43.587,58,42.233v-0.312   C58,40.688,57.427,39.556,56.428,38.815z M14,49C14,49.553,13.552,   50,13,50h-1v-4h-2v4H9c-0.552,0-1-0.447-1-0.999v-17   C8,31.449,8.448,31,9,31h4c0.552,0,1,0.449,1,1V49z M56,42.233c0,0.66-0.35,1.284-0.913,   1.628L36.915,54.962   c-2.367,1.443-5.37,1.376-7.655-0.17L16,45.833V35h4c1.06,0,2.469,2.034,3.088,3.409L23.354,39h10.646   C35.104,39,36,39.892,36,40.988C36,42.098,35.104,43,34,43H29h-5v2h5h5h2l17.525-4.807c0.637-0.18,   1.278-0.094,1.71,0.228   C55.722,40.781,56,41.328,56,41.922V42.233z"/>  <path style="fill:#d3d3d3;" d="M33,25.394v6.607C33,33.655,   34.347,35,36,35H38h1h4v-2h-4v-2h2v-2h-2v-3.577   c3.02-1.186,5-4.079,5-7.422c0-2.398-1.063-4.649-2.915-6.177c-1.85-1.524-4.283-2.134-6.683-1.668   c-3.155,0.614-5.671,3.153-6.261,6.318C27.39,20.523,29.933,24.041,33,   25.394z M30.108,16.84c0.44-2.364,2.319-4.262,4.677-4.721   c1.802-0.356,3.639,0.104,5.028,1.249S42,   16.202,42,18c0,2.702-1.719,5.011-4.276,5.745L37,23.954V33h-0.999   C35.449,33,35,32.553,35,32v-8.02l-0.689-0.225C31.822,22.943,29.509,20.067,30.108,16.84z"/>  <path d="M36,22c2.206,0,4-1.794,4-4s-1.794-4-4-4s-4,1.794-4,4S33.795,22,36,22z   M36,16c1.103,0,2,0.897,2,2s-0.897,2-2,2s-2-0.897-2-2S34.898,16,36,16z"/>  <circle style="fill:#d3d3d3;" cx="36" cy="18" r="3"/> </svg></button>`;

        /**
         * @desc Contains the raw HTML injected into the overlay to prompt for the master password for database
         *      unlocking.
         * @type {string}
         */
        this.masterPasswordHtml =
            `<div id="dc-master-overlay" class="dc-overlay"> <div id="dc-overlay-centerfield" class="dc-overlay-centerfield" style="top: 30%">  <h2 style="color:#ff0000;" id="dc-header-master-msg"></h2>  <br/><br/>  <span id="dc-prompt-master-msg"></span><br/>  <input type="password" class="dc-password-field" id="dc-db-password" title="Database Password"/>  <br/>  <div class="stat stat-bar">   <span id = "dc-master-status" class="stat-bar-rating" style="width: 0;"/>  </div>  <div class="dc-ruler-align">   <button class="dc-button" style="width:100%;" id="dc-unlock-database-btn"/>  </div>  <div class="dc-ruler-align">   <button class="dc-button dc-button-inverse"     style="width:100%;" id="dc-cancel-btn">Cancel</button>  </div> </div></div>`;

        /**
         * @desc Defines the raw HTML used describing each option menu.
         * @type {string}
         */
        this.settingsMenuHtml =
            `<div id="dc-overlay" class="dc-overlay"> <div id="dc-overlay-upload" class="dc-overlay-centerfield" style="display:none; top: 5%;">  <div class="dc-ruler-align">   <input type="text" class="dc-input-field" id="dc-file-path"       style="width: 100%;padding: 2px;margin-left: 4px;" readonly title="File Path"/>   <button class="dc-button dc-button-inverse" type="button" id="dc-select-file-path-btn"     style="top: -8px;"> . . .</button>  </div>  <textarea class="dc-textarea" rows="20" cols="128" id="dc-file-message-textarea"      placeholder="Enter any addition text to send with your message ..." maxlength="1820"></textarea>  <div class="dc-ruler-align" style="font-size:14px; padding-bottom:10px;">   <input id="dc-file-deletion-checkbox" class="ui-switch-checkbox" type="checkbox"       title="Add Deletion Link">   <span style="margin-top: 5px;">Send Deletion Link</span>  </div>  <div class="dc-ruler-align" style="font-size:14px; padding-bottom:10px;">   <input id="dc-file-name-random-checkbox" class="ui-switch-checkbox" type="checkbox" checked       title="Use Random File Name">   <span style="margin-top: 5px;">Randomize File Name</span>  </div>  <div class="stat stat-bar">   <span id = "dc-file-upload-status" class="stat-bar-rating" style="width: 0;"/>  </div>  <div class="dc-ruler-align">   <button class="dc-button" style="width:100%;" id="dc-file-upload-btn">Upload</button>  </div>  <div class="dc-ruler-align">   <button class="dc-button dc-button-inverse" style="width:100%;" id="dc-file-cancel-btn">    Close</button>  </div> </div> <div id="dc-overlay-password" class="dc-overlay-centerfield" style="display:none;">  <span>Primary Password:</span>  <input type="password" class="dc-password-field" id="dc-password-primary" placeholder="..."/><br/>  <span>Secondary Password:</span>  <input type="password" class="dc-password-field" id="dc-password-secondary" placeholder="..."/><br/>  <div class="dc-ruler-align">   <button class="dc-button" id="dc-save-pwd">Update Passwords</button>   <button class="dc-button dc-button-inverse" id="dc-reset-pwd">Reset Passwords</button>   <button class="dc-button dc-button-inverse" id="dc-cancel-btn">Cancel</button>  </div>  <button class="dc-button dc-button-inverse" style="width: 100%;" id="dc-cpy-pwds-btn">   Copy Current Passwords</button> </div> <div id="dc-update-overlay" class="dc-overlay-centerfield"   style="top: 5%;border: 1px solid;display: none">  <span>DiscordCrypt: Update Available</span>  <div class="dc-ruler-align">   <strong class="dc-update-field" id="dc-new-version"/>  </div>  <div class="dc-ruler-align">   <strong class="dc-update-field" id="dc-old-version"/>  </div>  <div class="dc-ruler-align">   <strong class="dc-update-field">Changelog:</strong></div>  <div class="dc-ruler-align">   <textarea class="dc-textarea" rows="20" cols="128" id="dc-changelog" readonly title="Update Changes ..."/>  </div>  <br>  <div class="dc-ruler-align">   <button class="dc-button" id="dc-restart-now-btn" style="width: 50%;">    Restart Discord Now</button>   <button class="dc-button dc-button-inverse" id="dc-restart-later-btn" style="width: 50%;">    Restart Discord Later</button>  </div> </div> <div id="dc-overlay-settings" class="dc-overlay-main" style="display: none;">  <div class="tab" id="dc-settings-tab">   <button class='dc-tab-link' id="dc-plugin-settings-btn">Plugin Settings</button>   <button class='dc-tab-link' id="dc-database-settings-btn">Database Settings</button>   <button class='dc-tab-link' id="dc-exit-settings-btn" style="float:right;">[ X ]</button>  </div>  <div class="tab-content" id="dc-plugin-settings-tab" style="display: block;">   <p style="text-align: center;">    <b>DiscordCrypt Settings</b>   </p>   <br/><br/>   <div class="dc-ruler-align">    <div class="dc-input-label">Primary Cipher:</div>    <select class="dc-input-field" id="dc-primary-cipher" title="Primary Cipher">     <option value="bf" selected>Blowfish ( 512-Bit )</option>     <option value="aes">AES ( 256-Bit )</option>     <option value="camel">Camellia ( 256-Bit )</option>     <option value="tdes">TripleDES ( 192-Bit )</option>     <option value="idea">IDEA ( 128-Bit )</option>    </select>   </div>   <div class="dc-ruler-align">    <div class="dc-input-label">Secondary Cipher:</div>    <select class="dc-input-field" id="dc-secondary-cipher" title="Secondary Cipher">     <option value="bf">Blowfish ( 512-Bit )</option>     <option value="aes">AES ( 256-Bit )</option>     <option value="camel">Camellia ( 256-Bit )</option>     <option value="idea">IDEA ( 256-Bit )</option>     <option value="tdes">TripleDES ( 192-Bit )</option>    </select>   </div>   <div class="dc-ruler-align">    <div class="dc-input-label">Cipher Padding Mode:</div>    <select class="dc-input-field" id="dc-settings-padding-mode" title="Cipher Padding Scheme">     <option value="pkc7">PKCS #7</option>     <option value="ans2">ANSI X9.23</option>     <option value="iso1">ISO 10126</option>     <option value="iso9">ISO 97971</option>    </select>   </div>   <div class="dc-ruler-align">    <div class="dc-input-label">Cipher Block Operation Mode:</div>    <select class="dc-input-field" id="dc-settings-cipher-mode" title="Cipher Block Operation Mode">     <option value="cbc">Cipher Block Chaining</option>     <option value="cfb">Cipher Feedback Mode</option>     <option value="ofb">Output Feedback Mode</option>    </select>   </div>   <div class="dc-ruler-align">    <div class="dc-input-label">Default Encryption Password:</div>    <input type="text" class="dc-input-field" id="dc-settings-default-pwd"        title="Default Encryption Password"/>   </div>   <div class="dc-ruler-align">    <div class="dc-input-label">Scanning Frequency:</div>    <input type="text" class="dc-input-field" id="dc-settings-scan-delay"        title="Scanning Frequency"/>   </div>   <div class="dc-ruler-align">    <div class="dc-input-label">Message Trigger:</div>    <input type="text" class="dc-input-field" id="dc-settings-encrypt-trigger" title="Message Trigger"/>   </div>   <div class="dc-hint">    <p>The suffix at the end of a typed message to indicate whether to encrypt the text.</p>    <p>Example: <u>This message will be encrypted.|ENC</u></p>   </div>   <div class="dc-ruler-align">    <div class="dc-input-label">Timed Message Expiration:</div>    <input type="number" class="dc-input-field" id="dc-settings-timed-expire"        title="Timed Message Expiration"/>   </div>   <div class="dc-hint">    <p>This indicates how long after an encrypted message is sent, should it be deleted in minutes.</p>    <p><u>Set this to "0" to disable timed messages.</u></p>   </div>   <div class="dc-ruler-align">    <div class="dc-input-label">New Master Database Password:</div>    <input type="text" class="dc-input-field" id="dc-master-password"        title="New Master Database Password"/>   </div>   <div class="dc-ruler-align">    <div class="dc-input-label">Use Embedded Messages:</div>    <input type="checkbox" class="dc-input-field" id="dc-embed-enabled"        title="Use Embedded Messages"/>   </div>   <div class="dc-hint">    <p>If enabled, send all encrypted messages using embeds.</p>    <p>     <b style="color: #f00">WARNING:</b>     <b> Using this option may result in your embedded permissions being globally revoked.</b>    </p>   </div>   <div class="dc-ruler-align">    <button id="dc-settings-save-btn" class="dc-button">Save & Apply</button>    <button id="dc-settings-reset-btn" class="dc-button dc-button-inverse">     Reset Settings</button>   </div>   <br/><br/><br/><br/>  </div>  <div class="tab-content" id="dc-database-settings-tab">   <p style="text-align: center;">    <b>Database Settings</b>   </p>   <br/><br/>   <div class="dc-scroll-table">    <table class="dc-table">     <thead>     <tr>      <th><b>Channel</b></th>      <th><b>Name</b></th>      <th><b>Options</b></th>     </tr>     </thead>     <tbody id="dc-database-entries">      <tr>       <td>Placeholder</td>       <td>Placeholder</td>       <td><button class="dc-button dc-button-inverse dc-button-small">Delete Entry</button></td>      </tr>     </tbody>    </table>   </div>   <br/><br/>   <div class="dc-ruler-align">    <button class="dc-button" id="dc-import-database-btn">Import Database(s)</button>    <button class="dc-button dc-button-inverse" id="dc-export-database-btn">Export Database</button>    <button class="dc-button dc-button-inverse" id="dc-erase-entries-btn">Erase Entries</button>   </div>  </div> </div> <div id="dc-overlay-exchange" class="dc-overlay-main" style="display: none;">  <div class="tab" id="dc-exchange-tab">   <button class='dc-tab-link' id="dc-tab-info-btn">Info</button>   <button class='dc-tab-link' id="dc-tab-keygen-btn">Key Generation</button>   <button class='dc-tab-link' id="dc-tab-handshake-btn">Secret Computation</button>   <button class='dc-tab-link' id="dc-exit-exchange-btn" style="float:right;">[ X ]</button>  </div>  <div class="tab-content" id="dc-about-tab" style="display: block;">   <p style="text-align: center;">    <b>Key Exchanger</b>   </p>   <br/>   <strong>What is this used for?</strong>   <ul class="dc-list">    <li>Simplifying the process or generating strong passwords for each user of DiscordCrypt     requires a secure channel to exchange these keys.</li>    <li>Using this generator, you may create new keys using standard algorithms such as     DH or ECDH for manual handshaking.</li>    <li>Follow the steps below and you can generate a password between channels or users     while being able to publicly post the messages.</li>    <li>This generator uses secure hash algorithms ( SHA-256 and SHA-512 ) in tandem with     the Scrypt KDF function to derive two keys.</li>   </ul>   <br/>   <strong>How do I use this?</strong>   <ul class="dc-list">    <li>Generate a key pair using the specified algorithm and key size on the     "Key Generation" tab.</li>    <li>Give your partner your public key by clicking the "Send Public Key" button.</li>    <li>Ask your partner to give you their public key using the same step above.</li>    <li>Copy your partner's public key and paste it in the "Secret Computation" tab and     select "Compute Secret Keys".</li>    <li>Wait for <span style="text-decoration: underline;color: #ff0000;">BOTH</span>     the primary and secondary keys to be generated.</li>    <li>A status bar is provided to easily tell you when both passwords     have been generated.</li>    <li>Click the "Apply Generated Passwords" button to apply both passwords to     the current user or channel.</li>   </ul>   <strong>Algorithms Supported:</strong>   <ul class="dc-list">    <li>     <a title="Diffie–Hellman key exchange"        href="https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange"        target="_blank" rel="noopener">Diffie-Hellman ( DH )</a>    </li>    <li>     <a title="Elliptic curve Diffie–Hellman"        href="https://en.wikipedia.org/wiki/Elliptic_curve_Diffie%E2%80%93Hellman"        target="_blank" rel="noopener">Elliptic Curve Diffie-Hellman ( ECDH )</a>    </li>   </ul>   <span style="text-decoration: underline; color: #ff0000;">       <strong>DO NOT:</strong>      </span>   <ul class="dc-list dc-list-red">    <li>     <strong>Post your private key. If you do, generate a new one IMMEDIATELY.</strong>    </li>    <li>     <strong>Alter your public key or have your partner alter theirs in any way.</strong>    </li>    <li>     <strong>Insert a random public key.</strong>    </li>   </ul>   <br/><br/><br/><br/>  </div>  <div class="tab-content" id="dc-keygen-tab">   <p style="text-align: center;">    <b style="font-size: large;">Secure Key Generation</b>   </p>   <br/>   <strong>Exchange Algorithm:</strong>   <select id="dc-keygen-method" title="Exchange Algorithm">    <option value="dh" selected>Diffie-Hellman</option>    <option value="ecdh">Elliptic-Curve Diffie-Hellman</option>   </select>   <br/><br/>   <strong>Key Length ( Bits ):</strong>   <select id="dc-keygen-algorithm" title="Key Length">    <option value="768">768</option>    <option value="1024">1024</option>    <option value="1536">1536</option>    <option value="2048">2048</option>    <option value="3072">3072</option>    <option value="4096">4096</option>    <option value="6144">6144</option>    <option value="8192" selected>8192</option>   </select>   <br/><br/>   <div class="dc-ruler-align">    <button id="dc-keygen-gen-btn" class="dc-button">Generate</button>    <button id="dc-keygen-clear-btn" class="dc-button dc-button-inverse">Clear</button>   </div>   <br/><br/><br/>   <strong>Private Key: (    <span style="text-decoration: underline; color: #ff0000;">KEEP SECRET</span>    )</strong><br/>   <textarea id="dc-priv-key-ta" rows="8" cols="128" maxsize="8192"       unselectable="on" disabled readonly title="Private Key"/>   <br/><br/>   <strong>Public Key:</strong><br/>   <textarea id="dc-pub-key-ta" rows="8" cols="128" maxsize="8192"       unselectable="on" disabled readonly title="Public Key"/>   <br/><br/>   <div class="dc-ruler-align">    <button id="dc-keygen-send-pub-btn" class="dc-button">Send Public Key</button>   </div>   <br/>   <ul class="dc-list dc-list-red">    <li>Never rely on copying these keys. Use the "Send Public Key" button     to send your key.</li>    <li>Public keys are automatically encoded with a random salts.</li>    <li>Posting these keys directly won't work since they aren't encoded     in the format required.</li>   </ul>   <br/><br/><br/><br/>  </div>  <div class="tab-content" id="dc-handshake-tab">   <p style="text-align: center;">    <b style="font-size: large;">Key Derivation</b>   </p>   <br/>   <p>    <span style="text-decoration: underline; color: #ff0000;">     <strong>NOTE:</strong>    </span>   </p>   <ul class="dc-list dc-list-red">    <li>Copy your partner's private key EXACTLY as it was posted.</li>    <li>Your last generated private key from the "Key Generation" tab     will be used to compute these keys.</li>   </ul>   <br/>   <strong>Partner's Public Key:</strong><br/>   <textarea id="dc-handshake-ppk" rows="8" cols="128" maxsize="16384" title="Partner's Public Key"/>   <br/><br/>   <div class="dc-ruler-align">    <button id="dc-handshake-paste-btn" class="dc-button dc-button-inverse">     Paste From Clipboard</button>    <button id="dc-handshake-compute-btn" class="dc-button">Compute Secret Keys</button>   </div>   <ul class="dc-list dc-list-red">    <li id="dc-handshake-algorithm">...</li>    <li id="dc-handshake-salts">...</li>    <li id="dc-handshake-secret">...</li>   </ul>   <br/>   <strong id="dc-handshake-prim-lbl">Primary Secret:</strong><br/>   <textarea id="dc-handshake-primary-key" rows="1" columns="128" maxsize="32768"       style="max-height: 14px;user-select: none;" unselectable="on" disabled       title="Primary Secret"/>   <br/><br/>   <strong id="dc-handshake-sec-lbl">Secondary Secret:</strong><br/>   <textarea id="dc-handshake-secondary-key" rows="1" columns="128" maxsize="32768"       style="max-height: 14px;user-select: none;" unselectable="on" disabled       title="Secondary Secret"/>   <br/><br/>   <div class="stat stat-bar" style="width:70%;">    <span id="dc-exchange-status" class="stat-bar-rating" style="width: 0;"/>   </div><br/>   <div class="dc-ruler-align">    <button id="dc-handshake-cpy-keys-btn" class="dc-button dc-button-inverse">     Copy Keys & Nuke</button>    <button id="dc-handshake-apply-keys-btn" class="dc-button">     Apply Generated Passwords</button>   </div>   <br/><br/><br/><br/>  </div> </div></div>`;

        /**
         * @desc The Base64 encoded SVG containing the unlocked status icon.
         * @type {string}
         */
        this.unlockIcon = "PHN2ZyBjbGFzcz0iZGMtc3ZnIiBmaWxsPSJsaWdodGdyZXkiIGhlaWdodD0iMjBweCIgdmlld0JveD0iMCAwIDI0I" +
            "DI0IiB3aWR0aD0iMjBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMTdjMS4xIDAgMi0u" +
            "OSAyLTJzLS45LTItMi0yLTIgLjktMiAyIC45IDIgMiAyem02LTloLTFWNmMwLTIuNzYtMi4yNC01LTUtNVM3IDMuMjQgNyA2aDEuOWM" +
            "wLTEuNzEgMS4zOS0zLjEgMy4xLTMuMSAxLjcxIDAgMy4xIDEuMzkgMy4xIDMuMXYySDZjLTEuMSAwLTIgLjktMiAydjEwYzAgMS4xLj" +
            "kgMiAyIDJoMTJjMS4xIDAgMi0uOSAyLTJWMTBjMC0xLjEtLjktMi0yLTJ6bTAgMTJINlYxMGgxMnYxMHoiPjwvcGF0aD48L3N2Zz4=";

        /**
         * @desc The Base64 encoded SVG containing the locked status icon.
         * @type {string}
         */
        this.lockIcon = "PHN2ZyBjbGFzcz0iZGMtc3ZnIiBmaWxsPSJsaWdodGdyZXkiIGhlaWdodD0iMjBweCIgdmlld0JveD0iMCAwIDI0IDI" +
            "0IiB3aWR0aD0iMjBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0aCBkPSJNMCAwaDI0djI0SD" +
            "BWMHoiIGlkPSJhIi8+PC9kZWZzPjxjbGlwUGF0aCBpZD0iYiI+PHVzZSBvdmVyZmxvdz0idmlzaWJsZSIgeGxpbms6aHJlZj0iI2EiL" +
            "z48L2NsaXBQYXRoPjxwYXRoIGNsaXAtcGF0aD0idXJsKCNiKSIgZD0iTTEyIDE3YzEuMSAwIDItLjkgMi0ycy0uOS0yLTItMi0yIC45" +
            "LTIgMiAuOSAyIDIgMnptNi05aC0xVjZjMC0yLjc2LTIuMjQtNS01LTVTNyAzLjI0IDcgNnYySDZjLTEuMSAwLTIgLjktMiAydjEwYzA" +
            "gMS4xLjkgMiAyIDJoMTJjMS4xIDAgMi0uOSAyLTJWMTBjMC0xLjEtLjktMi0yLTJ6TTguOSA2YzAtMS43MSAxLjM5LTMuMSAzLjEtMy" +
            "4xczMuMSAxLjM5IDMuMSAzLjF2Mkg4LjlWNnpNMTggMjBINlYxMGgxMnYxMHoiLz48L3N2Zz4=";

        /**
         * @desc These contain all libraries that will be loaded dynamically in the current JS VM.
         * @type {LibraryDefinition}
         */
        this.libraries = {
                        'currify.js': {"requiresElectron":false,"requiresBrowser":true,"code":"!function(n){if(\"object\"==typeof exports&&\"undefined\"!=typeof module)module.exports=n();else if(\"function\"==typeof define&&define.amd)define([],n);else{let r;(r=\"undefined\"!=typeof window?window:\"undefined\"!=typeof global?global:\"undefined\"!=typeof self?self:this).currify=n()}}(function(){var n,r,e;return function n(r,e,t){function o(f,u){if(!e[f]){if(!r[f]){var c=\"function\"==typeof require&&require;if(!u&&c)return c(f,!0);if(i)return i(f,!0);var l=new Error(`Cannot find module '${f}'`);throw l.code=\"MODULE_NOT_FOUND\",l}var p=e[f]={exports:{}};r[f][0].call(p.exports,function(n){var e=r[f][1][n];return o(e||n)},p,p.exports,n,r,e,t)}return e[f].exports}var i=\"function\"==typeof require&&require;for(let n=0;n<t.length;n++)o(t[n]);return o}({currify:[function(n,r,e){\"use strict\";var t=function n(r){return[function(n){return r.apply(void 0,arguments)},function(n,e){return r.apply(void 0,arguments)},function(n,e,t){return r.apply(void 0,arguments)},function(n,e,t,o){return r.apply(void 0,arguments)},function(n,e,t,o,i){return r.apply(void 0,arguments)}]};function o(n){if(\"function\"!=typeof n)throw Error(\"fn should be function!\")}r.exports=function n(r){for(var e=arguments.length,i=Array(e>1?e-1:0),f=1;f<e;f++)i[f-1]=arguments[f];if(o(r),i.length>=r.length)return r.apply(void 0,i);var u=function e(){return n.apply(void 0,[r].concat(i,Array.prototype.slice.call(arguments)))},c=r.length-i.length-1,l;return t(u)[c]||u}},{}]},{},[\"currify\"])(\"currify\")});\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIjAiXSwibmFtZXMiOlsiZiIsImV4cG9ydHMiLCJtb2R1bGUiLCJkZWZpbmUiLCJhbWQiLCJnIiwid2luZG93IiwiZ2xvYmFsIiwic2VsZiIsInRoaXMiLCJjdXJyaWZ5IiwiZSIsInQiLCJuIiwiciIsInMiLCJvIiwidSIsImEiLCJyZXF1aXJlIiwiaSIsIkVycm9yIiwiY29kZSIsImwiLCJjYWxsIiwibGVuZ3RoIiwiZm4iLCJhcHBseSIsInVuZGVmaW5lZCIsImFyZ3VtZW50cyIsImIiLCJjIiwiZCIsImNoZWNrIiwiX2xlbiIsImFyZ3MiLCJBcnJheSIsIl9rZXkiLCJhZ2FpbiIsImNvbmNhdCIsInByb3RvdHlwZSIsInNsaWNlIiwiY291bnQiLCJmdW5jIl0sIm1hcHBpbmdzIjoiQ0F3QkEsU0FBVUEsR0FDTixHQUF1QixpQkFBWkMsU0FBMEMsb0JBQVhDLE9BQ3RDQSxPQUFPRCxRQUFVRCxTQUNkLEdBQXNCLG1CQUFYRyxRQUF5QkEsT0FBT0MsSUFDOUNELFVBQVdILE9BQ1IsQ0FDSCxJQUFJSyxHQUVBQSxFQURrQixvQkFBWEMsT0FDSEEsT0FDcUIsb0JBQVhDLE9BQ1ZBLE9BQ21CLG9CQUFUQyxLQUNWQSxLQUVBQyxNQUVOQyxRQUFVVixLQWhCcEIsQ0FrQkcsV0FDQyxJQUFJRyxFQUFRRCxFQUFRRCxFQUNwQixPQUFPLFNBQVVVLEVBQUVDLEVBQUdDLEVBQUdDLEdBQ3JCLFNBQVNDLEVBQUVDLEVBQUdDLEdBQ1YsSUFBS0osRUFBRUcsR0FBSSxDQUNQLElBQUtKLEVBQUVJLEdBQUksQ0FDUCxJQUFJRSxFQUFzQixtQkFBWEMsU0FBeUJBLFFBQ3hDLElBQUtGLEdBQUtDLEVBQUcsT0FBT0EsRUFBRUYsR0FBRyxHQUN6QixHQUFJSSxFQUFHLE9BQU9BLEVBQUVKLEdBQUcsR0FDbkIsSUFBSWhCLEVBQUksSUFBSXFCLDZCQUE2QkwsTUFDekMsTUFBTWhCLEVBQUVzQixLQUFPLG1CQUFvQnRCLEVBRXZDLElBQUl1QixFQUFJVixFQUFFRyxJQUNOZixZQUVKVyxFQUFFSSxHQUFHLEdBQUdRLEtBQUtELEVBQUV0QixRQUFTLFNBQVNVLEdBQzdCLElBQUlFLEVBQUlELEVBQUVJLEdBQUcsR0FBR0wsR0FDaEIsT0FBT0ksRUFBRUYsR0FBUUYsSUFDbEJZLEVBQUdBLEVBQUV0QixRQUFTVSxFQUFHQyxFQUFHQyxFQUFHQyxHQUU5QixPQUFPRCxFQUFFRyxHQUFHZixRQUVoQixJQUFJbUIsRUFBc0IsbUJBQVhELFNBQXlCQSxRQUN4QyxJQUFLLElBQUlILEVBQUksRUFBR0EsRUFBSUYsRUFBRVcsT0FBUVQsSUFBS0QsRUFBRUQsRUFBRUUsSUFDdkMsT0FBT0QsRUF0QkosRUF3QkhMLFNBQVksU0FBU1MsRUFBU2pCLEVBQVFELEdBQ2xDLGFBRUEsSUFBSUQsRUFBSSxTQUFTQSxFQUFFMEIsR0FDZixPQUVJLFNBQVNSLEdBQ0wsT0FBT1EsRUFBR0MsV0FBTUMsRUFBV0MsWUFFL0IsU0FBU1gsRUFBR1ksR0FDUixPQUFPSixFQUFHQyxXQUFNQyxFQUFXQyxZQUUvQixTQUFTWCxFQUFHWSxFQUFHQyxHQUNYLE9BQU9MLEVBQUdDLFdBQU1DLEVBQVdDLFlBRS9CLFNBQVNYLEVBQUdZLEVBQUdDLEVBQUdDLEdBQ2QsT0FBT04sRUFBR0MsV0FBTUMsRUFBV0MsWUFFL0IsU0FBU1gsRUFBR1ksRUFBR0MsRUFBR0MsRUFBR3JCLEdBQ2pCLE9BQU9lLEVBQUdDLFdBQU1DLEVBQVdDLGNBd0J2QyxTQUFTSSxFQUFNUCxHQUNYLEdBQWtCLG1CQUFQQSxFQUFtQixNQUFNTCxNQUFNLDBCQXBCOUNuQixFQUFPRCxRQUFVLFNBQVNTLEVBQVFnQixHQUM5QixJQUFLLElBQUlRLEVBQU9MLFVBQVVKLE9BQVFVLEVBQU9DLE1BQU1GLEVBQU8sRUFBSUEsRUFBTyxFQUFJLEdBQUlHLEVBQU8sRUFBR0EsRUFBT0gsRUFBTUcsSUFDNUZGLEVBQUtFLEVBQU8sR0FBS1IsVUFBVVEsR0FLL0IsR0FGQUosRUFBTVAsR0FFRlMsRUFBS1YsUUFBVUMsRUFBR0QsT0FBUSxPQUFPQyxFQUFHQyxXQUFNQyxFQUFXTyxHQUV6RCxJQUFJRyxFQUFRLFNBQVNBLElBQ2pCLE9BQU81QixFQUFRaUIsV0FBTUMsR0FBWUYsR0FBSWEsT0FBT0osRUFBTUMsTUFBTUksVUFBVUMsTUFBTWpCLEtBQUtLLGNBRzdFYSxFQUFRaEIsRUFBR0QsT0FBU1UsRUFBS1YsT0FBUyxFQUNsQ2tCLEVBRUosT0FGVzNDLEVBQUVzQyxHQUFPSSxJQUVMSixhQU9uQixXQXZFRCxDQXVFYSJ9"},
            'curve25519.js': {"requiresElectron":true,"requiresBrowser":false,"code":"\"use strict\";global.Curve25519=class t{static init_25519_constants(t){const r=new Float64Array(16);if(t)for(let n=0;n<t.length;n++)r[n]=t[n];return r}static gf0(){return t.init_25519_constants()}static gf1(){return t.init_25519_constants([1])}static _121665(){return t.init_25519_constants([56129,1])}static D(){return t.init_25519_constants([30883,4953,19914,30187,55467,16705,2637,112,59544,30585,16505,36039,65139,11119,27886,20995])}static D2(){return t.init_25519_constants([61785,9906,39828,60374,45398,33411,5274,224,53552,61171,33010,6542,64743,22239,55772,9222])}static X(){return t.init_25519_constants([54554,36645,11616,51542,42930,38181,51040,26924,56412,64982,57905,49316,21502,52590,14035,8553])}static Y(){return t.init_25519_constants([26200,26214,26214,26214,26214,26214,26214,26214,26214,26214,26214,26214,26214,26214,26214,26214])}static I(){return t.init_25519_constants([41136,18958,6951,50414,58488,44335,6150,12099,55207,15867,153,11085,57099,20417,9344,11139])}static checkArrayTypes(){let t;for(let r=0;r<arguments.length;r++)if(\"[object Uint8Array]\"!==(t=Object.prototype.toString.call(arguments[r])))throw new TypeError(`unexpected type ${t}, use Uint8Array`)}static crypto_verify_32(t,r,n,o){function s(t,r,n,o,s){let e,a=0;for(e=0;e<s;e++)a|=t[r+e]^n[o+e];return(1&a-1>>>8)-1}return s(t,r,n,o,32)}static set25519(t,r){let n;for(n=0;n<16;n++)t[n]=0|r[n]}static sel25519(t,r,n){let o;const s=~(n-1);for(let n=0;n<16;n++)o=s&(t[n]^r[n]),t[n]^=o,r[n]^=o}static pack25519(r,n){function o(t){let r,n,o=1;for(r=0;r<16;r++)n=t[r]+o+65535,o=Math.floor(n/65536),t[r]=n-65536*o;t[0]+=o-1+37*(o-1)}let s,e,a;const i=t.init_25519_constants(),c=t.init_25519_constants();for(s=0;s<16;s++)c[s]=n[s];for(o(c),o(c),o(c),e=0;e<2;e++){for(i[0]=c[0]-65517,s=1;s<15;s++)i[s]=c[s]-65535-(i[s-1]>>16&1),i[s-1]&=65535;i[15]=c[15]-32767-(i[14]>>16&1),a=i[15]>>16&1,i[14]&=65535,t.sel25519(c,i,1-a)}for(s=0;s<16;s++)r[2*s]=255&c[s],r[2*s+1]=c[s]>>8}static par25519(r){const n=new Uint8Array(32);return t.pack25519(n,r),1&n[0]}static unpack25519(t,r){let n;for(n=0;n<16;n++)t[n]=r[2*n]+(r[2*n+1]<<8);t[15]&=32767}static blockadd(t,r,n){for(let o=0;o<16;o++)t[o]=r[o]+n[o]}static blocksub(t,r,n){for(let o=0;o<16;o++)t[o]=r[o]-n[o]}static blockround(t,r,n){let o,s,e=0,a=0,i=0,c=0,f=0,l=0,u=0,_=0,h=0,k=0,b=0,y=0,d=0,w=0,g=0,A=0,p=0,m=0,B=0,U=0,M=0,v=0,E=0,T=0,K=0,S=0,F=0,I=0,P=0,D=0,L=0;const X=n[0],Y=n[1],j=n[2],x=n[3],C=n[4],O=n[5],$=n[6],q=n[7],z=n[8],G=n[9],H=n[10],J=n[11],N=n[12],Q=n[13],R=n[14],V=n[15];e+=(o=r[0])*X,a+=o*Y,i+=o*j,c+=o*x,f+=o*C,l+=o*O,u+=o*$,_+=o*q,h+=o*z,k+=o*G,b+=o*H,y+=o*J,d+=o*N,w+=o*Q,g+=o*R,A+=o*V,a+=(o=r[1])*X,i+=o*Y,c+=o*j,f+=o*x,l+=o*C,u+=o*O,_+=o*$,h+=o*q,k+=o*z,b+=o*G,y+=o*H,d+=o*J,w+=o*N,g+=o*Q,A+=o*R,p+=o*V,i+=(o=r[2])*X,c+=o*Y,f+=o*j,l+=o*x,u+=o*C,_+=o*O,h+=o*$,k+=o*q,b+=o*z,y+=o*G,d+=o*H,w+=o*J,g+=o*N,A+=o*Q,p+=o*R,m+=o*V,c+=(o=r[3])*X,f+=o*Y,l+=o*j,u+=o*x,_+=o*C,h+=o*O,k+=o*$,b+=o*q,y+=o*z,d+=o*G,w+=o*H,g+=o*J,A+=o*N,p+=o*Q,m+=o*R,B+=o*V,f+=(o=r[4])*X,l+=o*Y,u+=o*j,_+=o*x,h+=o*C,k+=o*O,b+=o*$,y+=o*q,d+=o*z,w+=o*G,g+=o*H,A+=o*J,p+=o*N,m+=o*Q,B+=o*R,U+=o*V,l+=(o=r[5])*X,u+=o*Y,_+=o*j,h+=o*x,k+=o*C,b+=o*O,y+=o*$,d+=o*q,w+=o*z,g+=o*G,A+=o*H,p+=o*J,m+=o*N,B+=o*Q,U+=o*R,M+=o*V,u+=(o=r[6])*X,_+=o*Y,h+=o*j,k+=o*x,b+=o*C,y+=o*O,d+=o*$,w+=o*q,g+=o*z,A+=o*G,p+=o*H,m+=o*J,B+=o*N,U+=o*Q,M+=o*R,v+=o*V,_+=(o=r[7])*X,h+=o*Y,k+=o*j,b+=o*x,y+=o*C,d+=o*O,w+=o*$,g+=o*q,A+=o*z,p+=o*G,m+=o*H,B+=o*J,U+=o*N,M+=o*Q,v+=o*R,E+=o*V,h+=(o=r[8])*X,k+=o*Y,b+=o*j,y+=o*x,d+=o*C,w+=o*O,g+=o*$,A+=o*q,p+=o*z,m+=o*G,B+=o*H,U+=o*J,M+=o*N,v+=o*Q,E+=o*R,T+=o*V,k+=(o=r[9])*X,b+=o*Y,y+=o*j,d+=o*x,w+=o*C,g+=o*O,A+=o*$,p+=o*q,m+=o*z,B+=o*G,U+=o*H,M+=o*J,v+=o*N,E+=o*Q,T+=o*R,K+=o*V,b+=(o=r[10])*X,y+=o*Y,d+=o*j,w+=o*x,g+=o*C,A+=o*O,p+=o*$,m+=o*q,B+=o*z,U+=o*G,M+=o*H,v+=o*J,E+=o*N,T+=o*Q,K+=o*R,S+=o*V,y+=(o=r[11])*X,d+=o*Y,w+=o*j,g+=o*x,A+=o*C,p+=o*O,m+=o*$,B+=o*q,U+=o*z,M+=o*G,v+=o*H,E+=o*J,T+=o*N,K+=o*Q,S+=o*R,F+=o*V,d+=(o=r[12])*X,w+=o*Y,g+=o*j,A+=o*x,p+=o*C,m+=o*O,B+=o*$,U+=o*q,M+=o*z,v+=o*G,E+=o*H,T+=o*J,K+=o*N,S+=o*Q,F+=o*R,I+=o*V,w+=(o=r[13])*X,g+=o*Y,A+=o*j,p+=o*x,m+=o*C,B+=o*O,U+=o*$,M+=o*q,v+=o*z,E+=o*G,T+=o*H,K+=o*J,S+=o*N,F+=o*Q,I+=o*R,P+=o*V,g+=(o=r[14])*X,A+=o*Y,p+=o*j,m+=o*x,B+=o*C,U+=o*O,M+=o*$,v+=o*q,E+=o*z,T+=o*G,K+=o*H,S+=o*J,F+=o*N,I+=o*Q,P+=o*R,D+=o*V,A+=(o=r[15])*X,a+=38*(m+=o*j),i+=38*(B+=o*x),c+=38*(U+=o*C),f+=38*(M+=o*O),l+=38*(v+=o*$),u+=38*(E+=o*q),_+=38*(T+=o*z),h+=38*(K+=o*G),k+=38*(S+=o*H),b+=38*(F+=o*J),y+=38*(I+=o*N),d+=38*(P+=o*Q),w+=38*(D+=o*R),g+=38*(L+=o*V),e=(o=(e+=38*(p+=o*Y))+(s=1)+65535)-65536*(s=Math.floor(o/65536)),a=(o=a+s+65535)-65536*(s=Math.floor(o/65536)),i=(o=i+s+65535)-65536*(s=Math.floor(o/65536)),c=(o=c+s+65535)-65536*(s=Math.floor(o/65536)),f=(o=f+s+65535)-65536*(s=Math.floor(o/65536)),l=(o=l+s+65535)-65536*(s=Math.floor(o/65536)),u=(o=u+s+65535)-65536*(s=Math.floor(o/65536)),_=(o=_+s+65535)-65536*(s=Math.floor(o/65536)),h=(o=h+s+65535)-65536*(s=Math.floor(o/65536)),k=(o=k+s+65535)-65536*(s=Math.floor(o/65536)),b=(o=b+s+65535)-65536*(s=Math.floor(o/65536)),y=(o=y+s+65535)-65536*(s=Math.floor(o/65536)),d=(o=d+s+65535)-65536*(s=Math.floor(o/65536)),w=(o=w+s+65535)-65536*(s=Math.floor(o/65536)),g=(o=g+s+65535)-65536*(s=Math.floor(o/65536)),A=(o=A+s+65535)-65536*(s=Math.floor(o/65536)),e=(o=(e+=s-1+37*(s-1))+(s=1)+65535)-65536*(s=Math.floor(o/65536)),a=(o=a+s+65535)-65536*(s=Math.floor(o/65536)),i=(o=i+s+65535)-65536*(s=Math.floor(o/65536)),c=(o=c+s+65535)-65536*(s=Math.floor(o/65536)),f=(o=f+s+65535)-65536*(s=Math.floor(o/65536)),l=(o=l+s+65535)-65536*(s=Math.floor(o/65536)),u=(o=u+s+65535)-65536*(s=Math.floor(o/65536)),_=(o=_+s+65535)-65536*(s=Math.floor(o/65536)),h=(o=h+s+65535)-65536*(s=Math.floor(o/65536)),k=(o=k+s+65535)-65536*(s=Math.floor(o/65536)),b=(o=b+s+65535)-65536*(s=Math.floor(o/65536)),y=(o=y+s+65535)-65536*(s=Math.floor(o/65536)),d=(o=d+s+65535)-65536*(s=Math.floor(o/65536)),w=(o=w+s+65535)-65536*(s=Math.floor(o/65536)),g=(o=g+s+65535)-65536*(s=Math.floor(o/65536)),A=(o=A+s+65535)-65536*(s=Math.floor(o/65536)),e+=s-1+37*(s-1),t[0]=e,t[1]=a,t[2]=i,t[3]=c,t[4]=f,t[5]=l,t[6]=u,t[7]=_,t[8]=h,t[9]=k,t[10]=b,t[11]=y,t[12]=d,t[13]=w,t[14]=g,t[15]=A}static blockround_dest(r,n){t.blockround(r,n,n)}static inv25519(r,n){const o=t.init_25519_constants();let s;for(s=0;s<16;s++)o[s]=n[s];for(s=253;s>=0;s--)t.blockround_dest(o,o),2!==s&&4!==s&&t.blockround(o,o,n);for(s=0;s<16;s++)r[s]=o[s]}static crypto_scalarmult(r,n,o){const s=new Uint8Array(32),e=new Float64Array(80);let a,i;const c=t.init_25519_constants(),f=t.init_25519_constants(),l=t.init_25519_constants(),u=t.init_25519_constants(),_=t.init_25519_constants(),h=t.init_25519_constants();for(i=0;i<31;i++)s[i]=n[i];for(s[31]=127&n[31]|64,s[0]&=248,t.unpack25519(e,o),i=0;i<16;i++)f[i]=e[i],u[i]=c[i]=l[i]=0;for(c[0]=u[0]=1,i=254;i>=0;--i)a=s[i>>>3]>>>(7&i)&1,t.sel25519(c,f,a),t.sel25519(l,u,a),t.blockadd(_,c,l),t.blocksub(c,c,l),t.blockadd(l,f,u),t.blocksub(f,f,u),t.blockround_dest(u,_),t.blockround_dest(h,c),t.blockround(c,l,c),t.blockround(l,f,_),t.blockadd(_,c,l),t.blocksub(c,c,l),t.blockround_dest(f,c),t.blocksub(l,u,h),t.blockround(c,l,t._121665()),t.blockadd(c,c,u),t.blockround(l,l,c),t.blockround(c,u,h),t.blockround(u,f,e),t.blockround_dest(f,_),t.sel25519(c,f,a),t.sel25519(l,u,a);for(i=0;i<16;i++)e[i+16]=c[i],e[i+32]=l[i],e[i+48]=f[i],e[i+64]=u[i];const k=e.subarray(32),b=e.subarray(16);return t.inv25519(k,k),t.blockround(b,b,k),t.pack25519(r,b),0}static crypto_hash(t,r,n){function o(t,r,n,o){t[r]=n>>24&255,t[r+1]=n>>16&255,t[r+2]=n>>8&255,t[r+3]=255&n,t[r+4]=o>>24&255,t[r+5]=o>>16&255,t[r+6]=o>>8&255,t[r+7]=255&o}function s(t,r,n,o){const s=[1116352408,3609767458,1899447441,602891725,3049323471,3964484399,3921009573,2173295548,961987163,4081628472,1508970993,3053834265,2453635748,2937671579,2870763221,3664609560,3624381080,2734883394,310598401,1164996542,607225278,1323610764,1426881987,3590304994,1925078388,4068182383,2162078206,991336113,2614888103,633803317,3248222580,3479774868,3835390401,2666613458,4022224774,944711139,264347078,2341262773,604807628,2007800933,770255983,1495990901,1249150122,1856431235,1555081692,3175218132,1996064986,2198950837,2554220882,3999719339,2821834349,766784016,2952996808,2566594879,3210313671,3203337956,3336571891,1034457026,3584528711,2466948901,113926993,3758326383,338241895,168717936,666307205,1188179964,773529912,1546045734,1294757372,1522805485,1396182291,2643833823,1695183700,2343527390,1986661051,1014477480,2177026350,1206759142,2456956037,344077627,2730485921,1290863460,2820302411,3158454273,3259730800,3505952657,3345764771,106217008,3516065817,3606008344,3600352804,1432725776,4094571909,1467031594,275423344,851169720,430227734,3100823752,506948616,1363258195,659060556,3750685593,883997877,3785050280,958139571,3318307427,1322822218,3812723403,1537002063,2003034995,1747873779,3602036899,1955562222,1575990012,2024104815,1125592928,2227730452,2716904306,2361852424,442776044,2428436474,593698344,2756734187,3733110249,3204031479,2999351573,3329325298,3815920427,3391569614,3928383900,3515267271,566280711,3940187606,3454069534,4118630271,4000239992,116418474,1914138554,174292421,2731055270,289380356,3203993006,460393269,320620315,685471733,587496836,852142971,1086792851,1017036298,365543100,1126000580,2618297676,1288033470,3409855158,1501505948,4234509866,1607167915,987167468,1816402316,1246189591],e=new Int32Array(16),a=new Int32Array(16);let i,c,f,l,u,_,h,k,b,y,d,w,g,A,p,m,B,U,M,v,E,T,K,S,F,I,P=t[0],D=t[1],L=t[2],X=t[3],Y=t[4],j=t[5],x=t[6],C=t[7],O=r[0],$=r[1],q=r[2],z=r[3],G=r[4],H=r[5],J=r[6],N=r[7],Q=0;for(;o>=128;){for(M=0;M<16;M++)v=8*M+Q,e[M]=n[v+0]<<24|n[v+1]<<16|n[v+2]<<8|n[v+3],a[M]=n[v+4]<<24|n[v+5]<<16|n[v+6]<<8|n[v+7];for(M=0;M<80;M++)if(i=P,c=D,f=L,l=X,u=Y,_=j,h=x,k=C,b=O,y=$,d=q,w=z,g=G,A=H,p=J,m=N,K=65535&(T=N),S=T>>>16,F=65535&(E=C),I=E>>>16,K+=65535&(T=(G>>>14|Y<<18)^(G>>>18|Y<<14)^(Y>>>9|G<<23)),S+=T>>>16,F+=65535&(E=(Y>>>14|G<<18)^(Y>>>18|G<<14)^(G>>>9|Y<<23)),I+=E>>>16,K+=65535&(T=G&H^~G&J),S+=T>>>16,F+=65535&(E=Y&j^~Y&x),I+=E>>>16,K+=65535&(T=s[2*M+1]),S+=T>>>16,F+=65535&(E=s[2*M]),I+=E>>>16,E=e[M%16],S+=(T=a[M%16])>>>16,F+=65535&E,I+=E>>>16,F+=(S+=(K+=65535&T)>>>16)>>>16,K=65535&(T=U=65535&K|S<<16),S=T>>>16,F=65535&(E=B=65535&F|(I+=F>>>16)<<16),I=E>>>16,K+=65535&(T=(O>>>28|P<<4)^(P>>>2|O<<30)^(P>>>7|O<<25)),S+=T>>>16,F+=65535&(E=(P>>>28|O<<4)^(O>>>2|P<<30)^(O>>>7|P<<25)),I+=E>>>16,S+=(T=O&$^O&q^$&q)>>>16,F+=65535&(E=P&D^P&L^D&L),I+=E>>>16,k=65535&(F+=(S+=(K+=65535&T)>>>16)>>>16)|(I+=F>>>16)<<16,m=65535&K|S<<16,K=65535&(T=w),S=T>>>16,F=65535&(E=l),I=E>>>16,S+=(T=U)>>>16,F+=65535&(E=B),I+=E>>>16,D=i,L=c,X=f,Y=l=65535&(F+=(S+=(K+=65535&T)>>>16)>>>16)|(I+=F>>>16)<<16,j=u,x=_,C=h,P=k,$=b,q=y,z=d,G=w=65535&K|S<<16,H=g,J=A,N=p,O=m,M%16==15)for(v=0;v<16;v++)E=e[v],K=65535&(T=a[v]),S=T>>>16,F=65535&E,I=E>>>16,E=e[(v+9)%16],K+=65535&(T=a[(v+9)%16]),S+=T>>>16,F+=65535&E,I+=E>>>16,B=e[(v+1)%16],K+=65535&(T=((U=a[(v+1)%16])>>>1|B<<31)^(U>>>8|B<<24)^(U>>>7|B<<25)),S+=T>>>16,F+=65535&(E=(B>>>1|U<<31)^(B>>>8|U<<24)^B>>>7),I+=E>>>16,B=e[(v+14)%16],S+=(T=((U=a[(v+14)%16])>>>19|B<<13)^(B>>>29|U<<3)^(U>>>6|B<<26))>>>16,F+=65535&(E=(B>>>19|U<<13)^(U>>>29|B<<3)^B>>>6),I+=E>>>16,I+=(F+=(S+=(K+=65535&T)>>>16)>>>16)>>>16,e[v]=65535&F|I<<16,a[v]=65535&K|S<<16;K=65535&(T=O),S=T>>>16,F=65535&(E=P),I=E>>>16,E=t[0],S+=(T=r[0])>>>16,F+=65535&E,I+=E>>>16,I+=(F+=(S+=(K+=65535&T)>>>16)>>>16)>>>16,t[0]=P=65535&F|I<<16,r[0]=O=65535&K|S<<16,K=65535&(T=$),S=T>>>16,F=65535&(E=D),I=E>>>16,E=t[1],S+=(T=r[1])>>>16,F+=65535&E,I+=E>>>16,I+=(F+=(S+=(K+=65535&T)>>>16)>>>16)>>>16,t[1]=D=65535&F|I<<16,r[1]=$=65535&K|S<<16,K=65535&(T=q),S=T>>>16,F=65535&(E=L),I=E>>>16,E=t[2],S+=(T=r[2])>>>16,F+=65535&E,I+=E>>>16,I+=(F+=(S+=(K+=65535&T)>>>16)>>>16)>>>16,t[2]=L=65535&F|I<<16,r[2]=q=65535&K|S<<16,K=65535&(T=z),S=T>>>16,F=65535&(E=X),I=E>>>16,E=t[3],S+=(T=r[3])>>>16,F+=65535&E,I+=E>>>16,I+=(F+=(S+=(K+=65535&T)>>>16)>>>16)>>>16,t[3]=X=65535&F|I<<16,r[3]=z=65535&K|S<<16,K=65535&(T=G),S=T>>>16,F=65535&(E=Y),I=E>>>16,E=t[4],S+=(T=r[4])>>>16,F+=65535&E,I+=E>>>16,I+=(F+=(S+=(K+=65535&T)>>>16)>>>16)>>>16,t[4]=Y=65535&F|I<<16,r[4]=G=65535&K|S<<16,K=65535&(T=H),S=T>>>16,F=65535&(E=j),I=E>>>16,E=t[5],S+=(T=r[5])>>>16,F+=65535&E,I+=E>>>16,I+=(F+=(S+=(K+=65535&T)>>>16)>>>16)>>>16,t[5]=j=65535&F|I<<16,r[5]=H=65535&K|S<<16,K=65535&(T=J),S=T>>>16,F=65535&(E=x),I=E>>>16,E=t[6],S+=(T=r[6])>>>16,F+=65535&E,I+=E>>>16,I+=(F+=(S+=(K+=65535&T)>>>16)>>>16)>>>16,t[6]=x=65535&F|I<<16,r[6]=J=65535&K|S<<16,K=65535&(T=N),S=T>>>16,F=65535&(E=C),I=E>>>16,E=t[7],S+=(T=r[7])>>>16,F+=65535&E,I+=E>>>16,I+=(F+=(S+=(K+=65535&T)>>>16)>>>16)>>>16,t[7]=C=65535&F|I<<16,r[7]=N=65535&K|S<<16,Q+=128,o-=128}return o}const e=new Int32Array(8),a=new Int32Array(8),i=new Uint8Array(256);let c;const f=n;for(e[0]=1779033703,e[1]=3144134277,e[2]=1013904242,e[3]=2773480762,e[4]=1359893119,e[5]=2600822924,e[6]=528734635,e[7]=1541459225,a[0]=4089235720,a[1]=2227873595,a[2]=4271175723,a[3]=1595750129,a[4]=2917565137,a[5]=725511199,a[6]=4215389547,a[7]=327033209,s(e,a,r,n),n%=128,c=0;c<n;c++)i[c]=r[f-n+c];for(i[n]=128,i[(n=256-128*(n<112?1:0))-9]=0,o(i,n-8,f/536870912|0,f<<3),s(e,a,i,n),c=0;c<8;c++)o(t,8*c,e[c],a[c]);return 0}static add(r,n){const o=t.init_25519_constants(),s=t.init_25519_constants(),e=t.init_25519_constants(),a=t.init_25519_constants(),i=t.init_25519_constants(),c=t.init_25519_constants(),f=t.init_25519_constants(),l=t.init_25519_constants(),u=t.init_25519_constants();t.blocksub(o,r[1],r[0]),t.blocksub(u,n[1],n[0]),t.blockround(o,o,u),t.blockadd(s,r[0],r[1]),t.blockadd(u,n[0],n[1]),t.blockround(s,s,u),t.blockround(e,r[3],n[3]),t.blockround(e,e,t.D2()),t.blockround(a,r[2],n[2]),t.blockadd(a,a,a),t.blocksub(i,s,o),t.blocksub(c,a,e),t.blockadd(f,a,e),t.blockadd(l,s,o),t.blockround(r[0],i,c),t.blockround(r[1],l,f),t.blockround(r[2],f,c),t.blockround(r[3],i,l)}static pack(r,n){const o=t.init_25519_constants(),s=t.init_25519_constants(),e=t.init_25519_constants();t.inv25519(e,n[2]),t.blockround(o,n[0],e),t.blockround(s,n[1],e),t.pack25519(r,s),r[31]^=t.par25519(o)<<7}static scalarmult(r,n,o){function s(r,n,o){let s;for(s=0;s<4;s++)t.sel25519(r[s],n[s],o)}let e,a;for(t.set25519(r[0],t.gf0()),t.set25519(r[1],t.gf1()),t.set25519(r[2],t.gf1()),t.set25519(r[3],t.gf0()),a=255;a>=0;--a)s(r,n,e=o[a/8|0]>>(7&a)&1),add(n,r),add(r,r),s(r,n,e)}static scalarbase(r,n){const o=[t.init_25519_constants(),t.init_25519_constants(),t.init_25519_constants(),t.init_25519_constants()];t.set25519(o[0],t.X()),t.set25519(o[1],t.Y()),t.set25519(o[2],t.gf1()),t.blockround(o[3],t.X(),t.Y()),t.scalarmult(r,o,n)}static modL(t,r){const n=new Float64Array([237,211,245,92,26,99,18,88,214,156,247,162,222,249,222,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16]);let o,s,e,a;for(s=63;s>=32;--s){for(o=0,e=s-32,a=s-12;e<a;++e)r[e]+=o-16*r[s]*n[e-(s-32)],o=r[e]+128>>8,r[e]-=256*o;r[e]+=o,r[s]=0}for(o=0,e=0;e<32;e++)r[e]+=o-(r[31]>>4)*n[e],o=r[e]>>8,r[e]&=255;for(e=0;e<32;e++)r[e]-=o*n[e];for(s=0;s<32;s++)r[s+1]+=r[s]>>8,t[s]=255&r[s]}static reduce(r){const n=new Float64Array(64);let o;for(o=0;o<64;o++)n[o]=r[o];for(o=0;o<64;o++)r[o]=0;t.modL(r,n)}static curve25519_sign(r,n,o,s,e){function a(r,n,o,s){const e=new Uint8Array(64),a=new Uint8Array(64);let i,c;const f=new Float64Array(64),l=[t.init_25519_constants(),t.init_25519_constants(),t.init_25519_constants(),t.init_25519_constants()];for(i=0;i<o;i++)r[64+i]=n[i];for(i=0;i<32;i++)r[32+i]=s[i];for(t.crypto_hash(a,r.subarray(32),o+32),t.reduce(a),t.scalarbase(l,a),t.pack(r,l),i=0;i<32;i++)r[i+32]=s[32+i];for(t.crypto_hash(e,r,o+64),t.reduce(e),i=0;i<64;i++)f[i]=0;for(i=0;i<32;i++)f[i]=a[i];for(i=0;i<32;i++)for(c=0;c<32;c++)f[i+c]+=e[i]*s[c];return t.modL(r.subarray(32),f),o+64}function i(r,n,o,s,e){const a=new Uint8Array(64),i=new Uint8Array(64);let c,f;const l=new Float64Array(64),u=[t.init_25519_constants(),t.init_25519_constants(),t.init_25519_constants(),t.init_25519_constants()];for(r[0]=254,c=1;c<32;c++)r[c]=255;for(c=0;c<32;c++)r[32+c]=s[c];for(c=0;c<o;c++)r[64+c]=n[c];for(c=0;c<64;c++)r[o+64+c]=e[c];for(t.crypto_hash(i,r,o+128),t.reduce(i),t.scalarbase(u,i),t.pack(r,u),c=0;c<32;c++)r[c+32]=s[32+c];for(t.crypto_hash(a,r,o+64),t.reduce(a),c=0;c<64;c++)r[o+64+c]=0;for(c=0;c<64;c++)l[c]=0;for(c=0;c<32;c++)l[c]=i[c];for(c=0;c<32;c++)for(f=0;f<32;f++)l[c+f]+=a[c]*s[f];return t.modL(r.subarray(32,o+64),l),o+64}const c=new Uint8Array(64),f=[t.init_25519_constants(),t.init_25519_constants(),t.init_25519_constants(),t.init_25519_constants()];for(let t=0;t<32;t++)c[t]=s[t];c[0]&=248,c[31]&=127,c[31]|=64,t.scalarbase(f,c),t.pack(c.subarray(32),f);const l=128&c[63];let u;return u=e?i(r,n,o,c,e):a(r,n,o,c),r[63]|=l,u}static convertPublicKey(r){const n=new Uint8Array(32),o=t.init_25519_constants(),s=t.init_25519_constants(),e=t.init_25519_constants();return t.unpack25519(o,r),t.blockadd(s,o,t.gf1()),t.blocksub(e,o,t.gf1()),t.inv25519(s,s),t.blockround(s,s,e),t.pack25519(n,s),n}static curve25519_sign_open(r,n,o,s){function e(r,n,o,s){function e(r,n){function o(r,n){const o=new Uint8Array(32),s=new Uint8Array(32);return t.pack25519(o,r),t.pack25519(s,n),t.crypto_verify_32(o,0,s,0)}function s(r,n){const o=t.init_25519_constants();let s;for(s=0;s<16;s++)o[s]=n[s];for(s=250;s>=0;s--)t.blockround_dest(o,o),1!==s&&t.blockround(o,o,n);for(s=0;s<16;s++)r[s]=o[s]}const e=t.init_25519_constants(),a=t.init_25519_constants(),i=t.init_25519_constants(),c=t.init_25519_constants(),f=t.init_25519_constants(),l=t.init_25519_constants(),u=t.init_25519_constants();return t.set25519(r[2],t.gf1()),t.unpack25519(r[1],n),t.blockround_dest(i,r[1]),t.blockround(c,i,t.D()),t.blocksub(i,i,r[2]),t.blockadd(c,r[2],c),t.blockround_dest(f,c),t.blockround_dest(l,f),t.blockround(u,l,f),t.blockround(e,u,i),t.blockround(e,e,c),s(e,e),t.blockround(e,e,i),t.blockround(e,e,c),t.blockround(e,e,c),t.blockround(r[0],e,c),t.blockround_dest(a,r[0]),t.blockround(a,a,c),o(a,i)&&t.blockround(r[0],r[0],t.I()),t.blockround_dest(a,r[0]),t.blockround(a,a,c),o(a,i)?-1:(t.par25519(r[0])===n[31]>>7&&t.blocksub(r[0],t.gf0(),r[0]),t.blockround(r[3],r[0],r[1]),0)}let a,i;const c=new Uint8Array(32),f=new Uint8Array(64),l=[t.init_25519_constants(),t.init_25519_constants(),t.init_25519_constants(),t.init_25519_constants()],u=[t.init_25519_constants(),t.init_25519_constants(),t.init_25519_constants(),t.init_25519_constants()];if(o<64)return-1;if(e(u,s))return-1;for(a=0;a<o;a++)r[a]=n[a];for(a=0;a<32;a++)r[a+32]=s[a];if(t.crypto_hash(f,r,o),t.reduce(f),t.scalarmult(l,u,f),t.scalarbase(u,n.subarray(32)),add(l,u),t.pack(c,l),o-=64,t.crypto_verify_32(n,0,c,0)){for(a=0;a<o;a++)r[a]=0;return-1}for(a=0;a<o;a++)r[a]=n[a+64];return i=o}const a=t.convertPublicKey(s);return a[31]|=128&n[63],n[63]&=127,e(r,n,o,a)}static crypto_scalarmult_base(r,n){const o=new Uint8Array(32);return o[0]=9,t.crypto_scalarmult(r,n,o)}constructor(){this.sk=new Uint8Array(32),this.pk=new Uint8Array(32)}getPublicKey(t){return t?Buffer.from(this.pk).toString(t):Buffer.from(this.pk)}getPrivateKey(t){return t?Buffer.from(this.sk).toString(t):Buffer.from(this.sk)}setPrivateKey(r,n){this.sk=new Uint8Array(r),sk[0]&=248,sk[31]&=127,sk[31]|=64;for(let t=0;t<32;t++)this.pk[t]=0;return t.crypto_scalarmult_base(this.pk,this.sk),this.sk[0]&=248,this.sk[31]&=127,this.sk[31]|=64,this.pk[31]&=127,n?Buffer.from(this.pk).toString(n):Buffer.from(this.pk)}generateKeys(r,n){if(!Buffer.isBuffer(n)&&!Array.isArray(n))throw new Error(\"message must be a buffer\");if(32!==(n=new Uint8Array(Buffer.from(n))).length)throw new Error(\"private key must be 32 bytes\");for(let t=0;t<32;t++)this.sk[t]=n[t],this.pk[t]=0;return t.crypto_scalarmult_base(this.pk,this.sk),this.sk[0]&=248,this.sk[31]&=127,this.sk[31]|=64,this.pk[31]&=127,r?Buffer.from(this.pk).toString(r):Buffer.from(this.pk)}computeSecret(r,n,o){if(r=Buffer.isBuffer(r)||Array.isArray(r)?new Uint8Array(r):new Uint8Array(Buffer.from(r,n)),t.checkArrayTypes(r,this.sk),32!==r.length)throw new Error(\"wrong public key length\");if(32!==this.sk.length)throw new Error(\"wrong secret key length\");const s=new Uint8Array(32);return t.crypto_scalarmult(s,this.sk,r),o?Buffer.from(s).toString(o):Buffer.from(s)}sign(r,n){if(t.checkArrayTypes(this.sk,r),!Buffer.isBuffer(r)&&!Array.isArray(r))throw new Error(\"message must be a buffer\");if(r=new Uint8Array(Buffer.from(r)),32!==this.sk.length)throw new Error(\"wrong secret key length\");if(n&&(t.checkArrayTypes(n),64!==n.length))throw new Error(\"wrong random data length\");const o=new Uint8Array((n?128:64)+r.length);t.curve25519_sign(o,r,r.length,this.sk,n);const s=new Uint8Array(64);for(let t=0;t<s.length;t++)s[t]=o[t];return Buffer.from(s)}signMessage(r,n){if(!Buffer.isBuffer(r)&&!Array.isArray(r))throw new Error(\"message must be a buffer\");if(r=new Uint8Array(Buffer.from(r)),t.checkArrayTypes(r,this.sk),32!==this.sk.length)throw new Error(\"wrong secret key length\");if(n){if(t.checkArrayTypes(n),64!==n.length)throw new Error(\"wrong random data length\");const o=new Uint8Array(128+r.length);return t.curve25519_sign(o,r,r.length,this.sk,n),Buffer.from(o.subarray(0,64+r.length))}{const n=new Uint8Array(64+r.length);return t.curve25519_sign(n,r,r.length,this.sk),Buffer.from(n)}}static openMessage(r,n){if(!Buffer.isBuffer(r)&&!Array.isArray(r))throw new Error(\"publicKey must be a buffer\");if(r=new Uint8Array(Buffer.from(r)),!Buffer.isBuffer(n)&&!Array.isArray(n))throw new Error(\"message must be a buffer\");if(n=new Uint8Array(Buffer.from(n)),t.checkArrayTypes(n,r),32!==r.length)throw new Error(\"wrong public key length\");const o=new Uint8Array(n.length),s=t.curve25519_sign_open(o,n,n.length,r);return s<0?null:Buffer.from(o)}static verify(r,n,o){if(!Buffer.isBuffer(r)&&!Array.isArray(r))throw new Error(\"publicKey must be a buffer\");if(r=new Uint8Array(Buffer.from(r)),!Buffer.isBuffer(n)&&!Array.isArray(n))throw new Error(\"message must be a buffer\");if(n=new Uint8Array(Buffer.from(n)),!Buffer.isBuffer(o)&&!Array.isArray(o))throw new Error(\"message must be a buffer\");if(o=new Uint8Array(Buffer.from(o)),t.checkArrayTypes(n,o,r),64!==o.length)throw new Error(\"wrong signature length\");if(32!==r.length)throw new Error(\"wrong public key length\");const s=new Uint8Array(64+n.length),e=new Uint8Array(64+n.length);for(let t=0;t<64;t++)s[t]=o[t];for(let t=0;t<n.length;t++)s[t+64]=n[t];return t.curve25519_sign_open(e,s,s.length,r)>=0}};\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIjAiXSwibmFtZXMiOlsiZ2xvYmFsIiwiQ3VydmUyNTUxOSIsIltvYmplY3QgT2JqZWN0XSIsImluaXQiLCJyIiwiRmxvYXQ2NEFycmF5IiwiaSIsImxlbmd0aCIsImluaXRfMjU1MTlfY29uc3RhbnRzIiwidCIsImFyZ3VtZW50cyIsIk9iamVjdCIsInByb3RvdHlwZSIsInRvU3RyaW5nIiwiY2FsbCIsIlR5cGVFcnJvciIsIngiLCJ4aSIsInkiLCJ5aSIsInZuIiwibiIsImQiLCJhIiwicCIsInEiLCJiIiwiYyIsIm8iLCJjYXIyNTUxOSIsInYiLCJNYXRoIiwiZmxvb3IiLCJqIiwibSIsInNlbDI1NTE5IiwiVWludDhBcnJheSIsInBhY2syNTUxOSIsInQwIiwidDEiLCJ0MiIsInQzIiwidDQiLCJ0NSIsInQ2IiwidDciLCJ0OCIsInQ5IiwidDEwIiwidDExIiwidDEyIiwidDEzIiwidDE0IiwidDE1IiwidDE2IiwidDE3IiwidDE4IiwidDE5IiwidDIwIiwidDIxIiwidDIyIiwidDIzIiwidDI0IiwidDI1IiwidDI2IiwidDI3IiwidDI4IiwidDI5IiwidDMwIiwiYjAiLCJiMSIsImIyIiwiYjMiLCJiNCIsImI1IiwiYjYiLCJiNyIsImI4IiwiYjkiLCJiMTAiLCJiMTEiLCJiMTIiLCJiMTMiLCJiMTQiLCJiMTUiLCJibG9ja3JvdW5kIiwiYmxvY2tyb3VuZF9kZXN0IiwieiIsImUiLCJmIiwidW5wYWNrMjU1MTkiLCJibG9ja2FkZCIsImJsb2Nrc3ViIiwiXzEyMTY2NSIsIngzMiIsInN1YmFycmF5IiwieDE2IiwiaW52MjU1MTkiLCJvdXQiLCJ0czY0IiwiaCIsImwiLCJjcnlwdG9faGFzaGJsb2Nrc19obCIsImhoIiwiaGwiLCJLIiwid2giLCJJbnQzMkFycmF5Iiwid2wiLCJiaDAiLCJiaDEiLCJiaDIiLCJiaDMiLCJiaDQiLCJiaDUiLCJiaDYiLCJiaDciLCJibDAiLCJibDEiLCJibDIiLCJibDMiLCJibDQiLCJibDUiLCJibDYiLCJibDciLCJ0aCIsInRsIiwiYWgwIiwiYWgxIiwiYWgyIiwiYWgzIiwiYWg0IiwiYWg1IiwiYWg2IiwiYWg3IiwiYWwwIiwiYWwxIiwiYWwyIiwiYWwzIiwiYWw0IiwiYWw1IiwiYWw2IiwiYWw3IiwicG9zIiwiZyIsIkQyIiwidHgiLCJ0eSIsInppIiwicGFyMjU1MTkiLCJzIiwiY3N3YXAiLCJzZXQyNTUxOSIsImdmMCIsImdmMSIsImFkZCIsIlgiLCJZIiwic2NhbGFybXVsdCIsIkwiLCJjYXJyeSIsImsiLCJtb2RMIiwic20iLCJzayIsIm9wdF9ybmQiLCJjcnlwdG9fc2lnbl9kaXJlY3QiLCJjcnlwdG9faGFzaCIsInJlZHVjZSIsInNjYWxhcmJhc2UiLCJwYWNrIiwiY3J5cHRvX3NpZ25fZGlyZWN0X3JuZCIsInJuZCIsImVkc2siLCJzaWduQml0Iiwic21sZW4iLCJwayIsImNyeXB0b19zaWduX29wZW4iLCJ1bnBhY2tuZWciLCJuZXEyNTUxOSIsImNyeXB0b192ZXJpZnlfMzIiLCJwb3cyNTIzIiwiY2hrIiwibnVtIiwiZGVuIiwiZGVuMiIsImRlbjQiLCJkZW42IiwiRCIsIkkiLCJtbGVuIiwiZWRwayIsImNvbnZlcnRQdWJsaWNLZXkiLCJHIiwiY3J5cHRvX3NjYWxhcm11bHQiLCJ0aGlzIiwiZW5jb2RpbmciLCJCdWZmZXIiLCJmcm9tIiwicHJpdmF0ZV9rZXkiLCJjcnlwdG9fc2NhbGFybXVsdF9iYXNlIiwia2V5IiwiaXNCdWZmZXIiLCJBcnJheSIsImlzQXJyYXkiLCJFcnJvciIsInB1YmxpY0tleSIsImluRm9ybSIsIm91dEZvcm0iLCJjaGVja0FycmF5VHlwZXMiLCJzaGFyZWRLZXkiLCJtc2ciLCJvcHRfcmFuZG9tIiwiYnVmIiwiY3VydmUyNTUxOV9zaWduIiwic2lnbmF0dXJlIiwic2lnbmVkTXNnIiwidG1wIiwibGVuIiwiY3VydmUyNTUxOV9zaWduX29wZW4iXSwibWFwcGluZ3MiOiJBQTBCQSxhQWtCQUEsT0FBT0MsaUJBQW1CQSxFQUV0QkMsNEJBQTZCQyxHQUN6QixNQUFNQyxFQUFJ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"},
            'sha3.js': {"requiresElectron":true,"requiresBrowser":false,"code":"!function(){\"use strict\";let t=\"input is invalid type\",e=\"object\"==typeof window,r=e?window:{};r.JS_SHA3_NO_WINDOW&&(e=!1);let n=!e&&\"object\"==typeof self,i;!r.JS_SHA3_NO_NODE_JS&&\"object\"==typeof process&&process.versions&&process.versions.node?r=global:n&&(r=self);let o=!r.JS_SHA3_NO_ARRAY_BUFFER&&\"undefined\"!=typeof ArrayBuffer,s=\"0123456789abcdef\".split(\"\"),u=[31,7936,2031616,520093696],f=[4,1024,262144,67108864],a=[1,256,65536,16777216],h=[6,1536,393216,100663296],c=[0,8,16,24],l=[1,0,32898,0,32906,2147483648,2147516416,2147483648,32907,0,2147483649,0,2147516545,2147483648,32777,2147483648,138,0,136,0,2147516425,0,2147483658,0,2147516555,0,139,2147483648,32905,2147483648,32771,2147483648,32770,2147483648,128,2147483648,32778,0,2147483658,2147483648,2147516545,2147483648,32896,2147483648,2147483649,0,2147516424,2147483648],p=[224,256,384,512],d=[128,256],y=[\"hex\",\"buffer\",\"arrayBuffer\",\"array\",\"digest\"],b={128:168,256:136};!r.JS_SHA3_NO_NODE_JS&&Array.isArray||(Array.isArray=function(t){return\"[object Array]\"===Object.prototype.toString.call(t)}),!o||!r.JS_SHA3_NO_ARRAY_BUFFER_IS_VIEW&&ArrayBuffer.isView||(ArrayBuffer.isView=function(t){return\"object\"==typeof t&&t.buffer&&t.buffer.constructor===ArrayBuffer});let A=function(t,e,r){return function(n){return new j(t,e,t).update(n)[r]()}},B=function(t,e,r){return function(n,i){return new j(t,e,i).update(n)[r]()}},g=function(t,e,r){return function(e,n,i,o){return z[`cshake${t}`].update(e,n,i,o)[r]()}},w=function(t,e,r){return function(e,n,i,o){return z[`kmac${t}`].update(e,n,i,o)[r]()}},k=function(t,e,r,n){for(let i=0;i<y.length;++i){let o=y[i];t[o]=e(r,n,o)}return t},_=function(t,e){let r=A(t,e,\"hex\");return r.create=function(){return new j(t,e,t)},r.update=function(t){return r.create().update(t)},k(r,A,t,e)},S,C,x,m=[{name:\"keccak\",padding:a,bits:p,createMethod:_},{name:\"sha3\",padding:h,bits:p,createMethod:_},{name:\"shake\",padding:u,bits:d,createMethod:function(t,e){let r=B(t,e,\"hex\");return r.create=function(r){return new j(t,e,r)},r.update=function(t,e){return r.create(e).update(t)},k(r,B,t,e)}},{name:\"cshake\",padding:f,bits:d,createMethod:function(t,e){let r=b[t],n=g(t,e,\"hex\");return n.create=function(n,i,o){return i||o?new j(t,e,n).bytepad([i,o],r):z[\"shake\"+t].create(n)},n.update=function(t,e,r,i){return n.create(e,r,i).update(t)},k(n,g,t,e)}},{name:\"kmac\",padding:f,bits:d,createMethod:function(t,e){let r=b[t],n=w(t,e,\"hex\");return n.create=function(n,i,o){return new N(t,e,i).bytepad([\"KMAC\",o],r).bytepad([n],r)},n.update=function(t,e,r,i){return n.create(t,r,i).update(e)},k(n,w,t,e)}}],z={},O=[];for(let t=0;t<m.length;++t){let e=m[t],r=e.bits;for(let t=0;t<r.length;++t){let n=`${e.name}_${r[t]}`;if(O.push(n),z[n]=e.createMethod(r[t],e.padding),\"sha3\"!==e.name){let i=e.name+r[t];O.push(i),z[i]=z[n]}}}function j(t,e,r){this.blocks=[],this.s=[],this.padding=e,this.outputBits=r,this.reset=!0,this.finalized=!1,this.block=0,this.start=0,this.blockCount=1600-(t<<1)>>5,this.byteCount=this.blockCount<<2,this.outputBlocks=r>>5,this.extraBytes=(31&r)>>3;for(let t=0;t<50;++t)this.s[t]=0}function N(t,e,r){j.call(this,t,e,r)}j.prototype.update=function(e){if(this.finalized)return;let r,n=typeof e;if(\"string\"!==n){if(\"object\"!==n)throw t;if(null===e)throw t;if(o&&e.constructor===ArrayBuffer)e=new Uint8Array(e);else if(!(Array.isArray(e)||o&&ArrayBuffer.isView(e)))throw t;r=!0}let i=this.blocks,s=this.byteCount,u=e.length,f=this.blockCount,a=0,h=this.s,l,p;for(;a<u;){if(this.reset)for(this.reset=!1,i[0]=this.block,l=1;l<f+1;++l)i[l]=0;if(r)for(l=this.start;a<u&&l<s;++a)i[l>>2]|=e[a]<<c[3&l++];else for(l=this.start;a<u&&l<s;++a)(p=e.charCodeAt(a))<128?i[l>>2]|=p<<c[3&l++]:p<2048?(i[l>>2]|=(192|p>>6)<<c[3&l++],i[l>>2]|=(128|63&p)<<c[3&l++]):p<55296||p>=57344?(i[l>>2]|=(224|p>>12)<<c[3&l++],i[l>>2]|=(128|p>>6&63)<<c[3&l++],i[l>>2]|=(128|63&p)<<c[3&l++]):(p=65536+((1023&p)<<10|1023&e.charCodeAt(++a)),i[l>>2]|=(240|p>>18)<<c[3&l++],i[l>>2]|=(128|p>>12&63)<<c[3&l++],i[l>>2]|=(128|p>>6&63)<<c[3&l++],i[l>>2]|=(128|63&p)<<c[3&l++]);if(this.lastByteIndex=l,l>=s){for(this.start=l-s,this.block=i[f],l=0;l<f;++l)h[l]^=i[l];J(h),this.reset=!0}else this.start=l}return this},j.prototype.encode=function(t,e){let r=255&t,n=1,i=[r];for(r=255&(t>>=8);r>0;)i.unshift(r),r=255&(t>>=8),++n;return e?i.push(n):i.unshift(n),this.update(i),i.length},j.prototype.encodeString=function(e){let r,n=typeof e;if(\"string\"!==n){if(\"object\"!==n)throw t;if(null===e)throw t;if(o&&e.constructor===ArrayBuffer)e=new Uint8Array(e);else if(!(Array.isArray(e)||o&&ArrayBuffer.isView(e)))throw t;r=!0}let i=0,s=e.length;if(r)i=s;else for(let t=0;t<e.length;++t){let r=e.charCodeAt(t);r<128?i+=1:r<2048?i+=2:r<55296||r>=57344?i+=3:(r=65536+((1023&r)<<10|1023&e.charCodeAt(++t)),i+=4)}return i+=this.encode(8*i),this.update(e),i},j.prototype.bytepad=function(t,e){let r=this.encode(e);for(let e=0;e<t.length;++e)r+=this.encodeString(t[e]);let n=e-r%e,i=[];return i.length=n,this.update(i),this},j.prototype.finalize=function(){if(this.finalized)return;this.finalized=!0;let t=this.blocks,e=this.lastByteIndex,r=this.blockCount,n=this.s;if(t[e>>2]|=this.padding[3&e],this.lastByteIndex===this.byteCount)for(t[0]=t[r],e=1;e<r+1;++e)t[e]=0;for(t[r-1]|=2147483648,e=0;e<r;++e)n[e]^=t[e];J(n)},j.prototype.toString=j.prototype.hex=function(){this.finalize();let t=this.blockCount,e=this.s,r=this.outputBlocks,n=this.extraBytes,i=0,o=0,u=\"\",f;for(;o<r;){for(i=0;i<t&&o<r;++i,++o)f=e[i],u+=s[f>>4&15]+s[15&f]+s[f>>12&15]+s[f>>8&15]+s[f>>20&15]+s[f>>16&15]+s[f>>28&15]+s[f>>24&15];o%t==0&&(J(e),i=0)}return n&&(f=e[i],u+=s[f>>4&15]+s[15&f],n>1&&(u+=s[f>>12&15]+s[f>>8&15]),n>2&&(u+=s[f>>20&15]+s[f>>16&15])),u},j.prototype.arrayBuffer=function(){this.finalize();let t=this.blockCount,e=this.s,r=this.outputBlocks,n=this.extraBytes,i=0,o=0,s=this.outputBits>>3,u;u=n?new ArrayBuffer(r+1<<2):new ArrayBuffer(s);let f=new Uint32Array(u);for(;o<r;){for(i=0;i<t&&o<r;++i,++o)f[o]=e[i];o%t==0&&J(e)}return n&&(f[i]=e[i],u=u.slice(0,s)),u},j.prototype.buffer=j.prototype.arrayBuffer,j.prototype.digest=j.prototype.array=function(){this.finalize();let t=this.blockCount,e=this.s,r=this.outputBlocks,n=this.extraBytes,i=0,o=0,s=[],u,f;for(;o<r;){for(i=0;i<t&&o<r;++i,++o)u=o<<2,f=e[i],s[u]=255&f,s[u+1]=f>>8&255,s[u+2]=f>>16&255,s[u+3]=f>>24&255;o%t==0&&J(e)}return n&&(u=o<<2,f=e[i],s[u]=255&f,n>1&&(s[u+1]=f>>8&255),n>2&&(s[u+2]=f>>16&255)),s},N.prototype=new j,N.prototype.finalize=function(){return this.encode(this.outputBits,!0),j.prototype.finalize.call(this)};let J=function(t){let e,r,n,i,o,s,u,f,a,h,c,p,d,y,b,A,B,g,w,k,_,S,C,x,m,z,O,j,N,J,M,I,R,E,H,U,V,F,$,v,D,W,Y,K,q,G,L,P,Q,T,X,Z,tt,et,rt,nt,it,ot,st,ut,ft,at,ht;for(n=0;n<48;n+=2)i=t[0]^t[10]^t[20]^t[30]^t[40],o=t[1]^t[11]^t[21]^t[31]^t[41],s=t[2]^t[12]^t[22]^t[32]^t[42],u=t[3]^t[13]^t[23]^t[33]^t[43],f=t[4]^t[14]^t[24]^t[34]^t[44],a=t[5]^t[15]^t[25]^t[35]^t[45],h=t[6]^t[16]^t[26]^t[36]^t[46],c=t[7]^t[17]^t[27]^t[37]^t[47],e=(p=t[8]^t[18]^t[28]^t[38]^t[48])^(s<<1|u>>>31),r=(d=t[9]^t[19]^t[29]^t[39]^t[49])^(u<<1|s>>>31),t[0]^=e,t[1]^=r,t[10]^=e,t[11]^=r,t[20]^=e,t[21]^=r,t[30]^=e,t[31]^=r,t[40]^=e,t[41]^=r,e=i^(f<<1|a>>>31),r=o^(a<<1|f>>>31),t[2]^=e,t[3]^=r,t[12]^=e,t[13]^=r,t[22]^=e,t[23]^=r,t[32]^=e,t[33]^=r,t[42]^=e,t[43]^=r,e=s^(h<<1|c>>>31),r=u^(c<<1|h>>>31),t[4]^=e,t[5]^=r,t[14]^=e,t[15]^=r,t[24]^=e,t[25]^=r,t[34]^=e,t[35]^=r,t[44]^=e,t[45]^=r,e=f^(p<<1|d>>>31),r=a^(d<<1|p>>>31),t[6]^=e,t[7]^=r,t[16]^=e,t[17]^=r,t[26]^=e,t[27]^=r,t[36]^=e,t[37]^=r,t[46]^=e,t[47]^=r,e=h^(i<<1|o>>>31),r=c^(o<<1|i>>>31),t[8]^=e,t[9]^=r,t[18]^=e,t[19]^=r,t[28]^=e,t[29]^=r,t[38]^=e,t[39]^=r,t[48]^=e,t[49]^=r,y=t[0],b=t[1],G=t[11]<<4|t[10]>>>28,L=t[10]<<4|t[11]>>>28,j=t[20]<<3|t[21]>>>29,N=t[21]<<3|t[20]>>>29,ut=t[31]<<9|t[30]>>>23,ft=t[30]<<9|t[31]>>>23,W=t[40]<<18|t[41]>>>14,Y=t[41]<<18|t[40]>>>14,E=t[2]<<1|t[3]>>>31,H=t[3]<<1|t[2]>>>31,A=t[13]<<12|t[12]>>>20,B=t[12]<<12|t[13]>>>20,P=t[22]<<10|t[23]>>>22,Q=t[23]<<10|t[22]>>>22,J=t[33]<<13|t[32]>>>19,M=t[32]<<13|t[33]>>>19,at=t[42]<<2|t[43]>>>30,ht=t[43]<<2|t[42]>>>30,et=t[5]<<30|t[4]>>>2,rt=t[4]<<30|t[5]>>>2,U=t[14]<<6|t[15]>>>26,V=t[15]<<6|t[14]>>>26,g=t[25]<<11|t[24]>>>21,w=t[24]<<11|t[25]>>>21,T=t[34]<<15|t[35]>>>17,X=t[35]<<15|t[34]>>>17,I=t[45]<<29|t[44]>>>3,R=t[44]<<29|t[45]>>>3,x=t[6]<<28|t[7]>>>4,m=t[7]<<28|t[6]>>>4,nt=t[17]<<23|t[16]>>>9,it=t[16]<<23|t[17]>>>9,F=t[26]<<25|t[27]>>>7,$=t[27]<<25|t[26]>>>7,k=t[36]<<21|t[37]>>>11,_=t[37]<<21|t[36]>>>11,Z=t[47]<<24|t[46]>>>8,tt=t[46]<<24|t[47]>>>8,K=t[8]<<27|t[9]>>>5,q=t[9]<<27|t[8]>>>5,z=t[18]<<20|t[19]>>>12,O=t[19]<<20|t[18]>>>12,ot=t[29]<<7|t[28]>>>25,st=t[28]<<7|t[29]>>>25,v=t[38]<<8|t[39]>>>24,D=t[39]<<8|t[38]>>>24,S=t[48]<<14|t[49]>>>18,C=t[49]<<14|t[48]>>>18,t[0]=y^~A&g,t[1]=b^~B&w,t[10]=x^~z&j,t[11]=m^~O&N,t[20]=E^~U&F,t[21]=H^~V&$,t[30]=K^~G&P,t[31]=q^~L&Q,t[40]=et^~nt&ot,t[41]=rt^~it&st,t[2]=A^~g&k,t[3]=B^~w&_,t[12]=z^~j&J,t[13]=O^~N&M,t[22]=U^~F&v,t[23]=V^~$&D,t[32]=G^~P&T,t[33]=L^~Q&X,t[42]=nt^~ot&ut,t[43]=it^~st&ft,t[4]=g^~k&S,t[5]=w^~_&C,t[14]=j^~J&I,t[15]=N^~M&R,t[24]=F^~v&W,t[25]=$^~D&Y,t[34]=P^~T&Z,t[35]=Q^~X&tt,t[44]=ot^~ut&at,t[45]=st^~ft&ht,t[6]=k^~S&y,t[7]=_^~C&b,t[16]=J^~I&x,t[17]=M^~R&m,t[26]=v^~W&E,t[27]=D^~Y&H,t[36]=T^~Z&K,t[37]=X^~tt&q,t[46]=ut^~at&et,t[47]=ft^~ht&rt,t[8]=S^~y&A,t[9]=C^~b&B,t[18]=I^~x&z,t[19]=R^~m&O,t[28]=W^~E&U,t[29]=Y^~H&V,t[38]=Z^~K&G,t[39]=tt^~q&L,t[48]=at^~et&nt,t[49]=ht^~rt&it,t[0]^=l[n],t[1]^=l[n+1]};for(let t=0;t<O.length;++t)global[O[t]]=z[O[t]]}();\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIjAiXSwibmFtZXMiOlsiRVJST1IiLCJXSU5ET1ciLCJ3aW5kb3ciLCJyb290IiwiSlNfU0hBM19OT19XSU5ET1ciLCJXRUJfV09SS0VSIiwic2VsZiIsIk5PREVfSlMiLCJKU19TSEEzX05PX05PREVfSlMiLCJwcm9jZXNzIiwidmVyc2lvbnMiLCJub2RlIiwiZ2xvYmFsIiwiQVJSQVlfQlVGRkVSIiwiSlNfU0hBM19OT19BUlJBWV9CVUZGRVIiLCJBcnJheUJ1ZmZlciIsIkhFWF9DSEFSUyIsInNwbGl0IiwiU0hBS0VfUEFERElORyIsIkNTSEFLRV9QQURESU5HIiwiS0VDQ0FLX1BBRERJTkciLCJQQURESU5HIiwiU0hJRlQiLCJSQyIsIkJJVFMiLCJTSEFLRV9CSVRTIiwiT1VUUFVUX1RZUEVTIiwiQ1NIQUtFX0JZVEVQQUQiLCIxMjgiLCIyNTYiLCJBcnJheSIsImlzQXJyYXkiLCJvYmoiLCJPYmplY3QiLCJwcm90b3R5cGUiLCJ0b1N0cmluZyIsImNhbGwiLCJKU19TSEEzX05PX0FSUkFZX0JVRkZFUl9JU19WSUVXIiwiaXNWaWV3IiwiYnVmZmVyIiwiY29uc3RydWN0b3IiLCJjcmVhdGVPdXRwdXRNZXRob2QiLCJiaXRzIiwicGFkZGluZyIsIm91dHB1dFR5cGUiLCJtZXNzYWdlIiwiS2VjY2FrIiwidXBkYXRlIiwiY3JlYXRlU2hha2VPdXRwdXRNZXRob2QiLCJvdXRwdXRCaXRzIiwiY3JlYXRlQ3NoYWtlT3V0cHV0TWV0aG9kIiwibiIsInMiLCJtZXRob2RzIiwiY3JlYXRlS21hY091dHB1dE1ldGhvZCIsImtleSIsImNyZWF0ZU91dHB1dE1ldGhvZHMiLCJtZXRob2QiLCJjcmVhdGVNZXRob2QiLCJpIiwibGVuZ3RoIiwidHlwZSIsImNyZWF0ZSIsImNyZWF0ZVNoYWtlTWV0aG9kIiwiY3JlYXRlQ3NoYWtlTWV0aG9kIiwiY3JlYXRlS21hY01ldGhvZCIsImFsZ29yaXRobXMiLCJuYW1lIiwidyIsImJ5dGVwYWQiLCJLbWFjIiwibWV0aG9kTmFtZXMiLCJhbGdvcml0aG0iLCJqIiwibWV0aG9kTmFtZSIsInB1c2giLCJuZXdNZXRob2ROYW1lIiwidGhpcyIsImJsb2NrcyIsInJlc2V0IiwiZmluYWxpemVkIiwiYmxvY2siLCJzdGFydCIsImJsb2NrQ291bnQiLCJieXRlQ291bnQiLCJvdXRwdXRCbG9ja3MiLCJleHRyYUJ5dGVzIiwibm90U3RyaW5nIiwiVWludDhBcnJheSIsImluZGV4IiwiY29kZSIsImNoYXJDb2RlQXQiLCJsYXN0Qnl0ZUluZGV4IiwiZiIsImVuY29kZSIsIngiLCJyaWdodCIsIm8iLCJieXRlcyIsInVuc2hpZnQiLCJlbmNvZGVTdHJpbmciLCJzdHIiLCJzdHJzIiwicGFkZGluZ0J5dGVzIiwiemVyb3MiLCJmaW5hbGl6ZSIsImhleCIsImFycmF5QnVmZmVyIiwiYXJyYXkiLCJVaW50MzJBcnJheSIsInNsaWNlIiwiZGlnZXN0Iiwib2Zmc2V0IiwiaCIsImwiLCJjMCIsImMxIiwiYzIiLCJjMyIsImM0IiwiYzUiLCJjNiIsImM3IiwiYzgiLCJjOSIsImIwIiwiYjEiLCJiMiIsImIzIiwiYjQiLCJiNSIsImI2IiwiYjciLCJiOCIsImI5IiwiYjEwIiwiYjExIiwiYjEyIiwiYjEzIiwiYjE0IiwiYjE1IiwiYjE2IiwiYjE3IiwiYjE4IiwiYjE5IiwiYjIwIiwiYjIxIiwiYjIyIiwiYjIzIiwiYjI0IiwiYjI1IiwiYjI2IiwiYjI3IiwiYjI4IiwiYjI5IiwiYjMwIiwiYjMxIiwiYjMyIiwiYjMzIiwiYjM0IiwiYjM1IiwiYjM2IiwiYjM3IiwiYjM4IiwiYjM5IiwiYjQwIiwiYjQxIiwiYjQyIiwiYjQzIiwiYjQ0IiwiYjQ1IiwiYjQ2IiwiYjQ3IiwiYjQ4IiwiYjQ5Il0sIm1hcHBpbmdzIjoiQ0F1QkEsV0FDSSxhQUVBLElBQUlBLEVBQVEsd0JBQ1JDLEVBQTJCLGlCQUFYQyxPQUNoQkMsRUFBT0YsRUFBU0MsVUFDaEJDLEVBQUtDLG9CQUNMSCxHQUFTLEdBRWIsSUFBSUksR0FBY0osR0FBMEIsaUJBQVRLLEtBQy9CQyxHQUFX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RUFBR0MsRUFBRy9ELEVBQUdnRSxFQUFJQyxFQUFJQyxFQUFJQyxFQUFJQyxFQUFJQyxFQUFJQyxFQUFJQyxFQUFJQyxFQUFJQyxFQUM3Q0MsRUFBSUMsRUFBSUMsRUFBSUMsRUFBSUMsRUFBSUMsRUFBSUMsRUFBSUMsRUFBSUMsRUFBSUMsRUFBSUMsRUFBS0MsRUFBS0MsRUFBS0MsRUFBS0MsRUFBS0MsRUFBS0MsRUFBS0MsRUFDM0VDLEVBQUtDLEVBQUtDLEVBQUtDLEVBQUtDLEVBQUtDLEVBQUtDLEVBQUtDLEVBQUtDLEVBQUtDLEVBQUtDLEVBQUtDLEVBQUtDLEVBQUtDLEVBQUtDLEVBQUtDLEVBQzNFQyxFQUFLQyxFQUFLQyxFQUFLQyxFQUFLQyxFQUFLQyxHQUFLQyxHQUFLQyxHQUFLQyxHQUFLQyxHQUFLQyxHQUFLQyxHQUFLQyxHQUFLQyxHQUFLQyxHQUFLQyxHQUMvRSxJQUFLM0gsRUFBSSxFQUFHQSxFQUFJLEdBQUlBLEdBQUssRUFDckJnRSxFQUFLL0QsRUFBRSxHQUFLQSxFQUFFLElBQU1BLEVBQUUsSUFBTUEsRUFBRSxJQUFNQSxFQUFFLElBQ3RDZ0UsRUFBS2hFLEVBQUUsR0FBS0EsRUFBRSxJQUFNQSxFQUFFLElBQU1BLEVBQUUsSUFBTUEsRUFBRSxJQUN0Q2lFLEVBQUtqRSxFQUFFLEdBQUtBLEVBQUUsSUFBTUEsRUFBRSxJQUFNQSxFQUFFLElBQU1BLEVBQUUsSUFDdENrRSxFQUFLbEUsRUFBRSxHQUFLQSxFQUFFLElBQU1BLEVBQUUsSUFBTUEsRUFBRSxJQUFNQSxFQUFFLElBQ3RDbUUsRUFBS25FLEVBQUUsR0FBS0EsRUFBRSxJQUFNQSxFQUFFLElBQU1BLEVBQUUsSUFBTUEsRUFBRSxJQUN0Q29FLEVBQUtwRSxFQUFFLEdBQUtBLEVBQUUsSUFBTUEsRUFBRSxJQUFNQSxFQUFFLElBQU1BLEVBQUUsSUFDdENxRSxFQUFLckUsRUFBRSxHQUFLQSxFQUFFLElBQU1BLEVBQUUsSUFBTUEsRUFBRSxJQUFNQSxFQUFFLElBQ3RDc0UsRUFBS3RFLEVBQUUsR0FBS0EsRUFBRSxJQUFNQSxFQUFFLElBQU1BLEVBQUUsSUFBTUEsRUFBRSxJQUl0QzZELEdBSEFVLEVBQUt2RSxFQUFFLEdBQUtBLEVBQUUsSUFBTUEsRUFBRSxJQUFNQSxFQUFFLElBQU1BLEVBQUUsTUFHM0JpRSxHQUFNLEVBQU1DLElBQU8sSUFDOUJKLEdBSEFVLEVBQUt4RSxFQUFFLEdBQUtBLEVBQUUsSUFBTUEsRUFBRSxJQUFNQSxFQUFFLElBQU1BLEVBQUUsTUFHM0JrRSxHQUFNLEVBQU1ELElBQU8sSUFDOUJqRSxFQUFFLElBQU02RCxFQUNSN0QsRUFBRSxJQUFNOEQsRUFDUjlELEVBQUUsS0FBTzZELEVBQ1Q3RCxFQUFFLEtBQU84RCxFQUNUOUQsRUFBRSxLQUFPNkQsRUFDVDdELEVBQUUsS0FBTzhELEVBQ1Q5RCxFQUFFLEtBQU82RCxFQUNUN0QsRUFBRSxLQUFPOEQsRUFDVDlELEVBQUUsS0FBTzZELEVBQ1Q3RCxFQUFFLEtBQU84RCxFQUNURCxFQUFJRSxHQUFPSSxHQUFNLEVBQU1DLElBQU8sSUFDOUJOLEVBQUlFLEdBQU9JLEdBQU0sRUFBTUQsSUFBTyxJQUM5Qm5FLEVBQUUsSUFBTTZELEVBQ1I3RCxFQUFFLElBQU04RCxFQUNSOUQsRUFBRSxLQUFPNkQsRUFDVDdELEVBQUUsS0FBTzhELEVBQ1Q5RCxFQUFFLEtBQU82RCxFQUNUN0QsRUFBRSxLQUFPOEQsRUFDVDlELEVBQUUsS0FBTzZELEVBQ1Q3RCxFQUFFLEtBQU84RCxFQUNUOUQsRUFBRSxLQUFPNkQsRUFDVDdELEVBQUUsS0FBTzhELEVBQ1RELEVBQUlJLEdBQU9JLEdBQU0sRUFBTUMsSUFBTyxJQUM5QlIsRUFBSUksR0FBT0ksR0FBTSxFQUFNRCxJQUFPLElBQzlCckUsRUFBRSxJQUFNNkQsRUFDUjdELEVBQUUsSUFBTThELEVBQ1I5RCxFQUFFLEtBQU82RCxFQUNUN0QsRUFBRSxLQUFPOEQsRUFDVDlELEVBQUUsS0FBTzZELEVBQ1Q3RCxFQUFFLEtBQU84RCxFQUNUOUQsRUFBRSxLQUFPNkQsRUFDVDdELEVBQUUsS0FBTzhELEVBQ1Q5RCxFQUFFLEtBQU82RCxFQUNUN0QsRUFBRSxLQUFPOEQsRUFDVEQsRUFBSU0sR0FBT0ksR0FBTSxFQUFNQyxJQUFPLElBQzlCVixFQUFJTSxHQUFPSSxHQUFNLEVBQU1ELElBQU8sSUFDOUJ2RSxFQUFFLElBQU02RCxFQUNSN0QsRUFBRSxJQUFNOEQsRUFDUjlELEVBQUUsS0FBTzZELEVBQ1Q3RCxFQUFFLEtBQU84RCxFQUNUOUQsRUFBRSxLQUFPNkQsRUFDVDdELEVBQUUsS0FBTzhELEVBQ1Q5RCxFQUFFLEtBQU82RCxFQUNUN0QsRUFBRSxLQUFPOEQsRUFDVDlELEVBQUUsS0FBTzZELEVBQ1Q3RCxFQUFFLEtBQU84RCxFQUNURCxFQUFJUSxHQUFPTixHQUFNLEVBQU1DLElBQU8sSUFDOUJGLEVBQUlRLEdBQU9OLEdBQU0sRUFBTUQsSUFBTyxJQUM5Qi9ELEVBQUUsSUFBTTZELEVBQ1I3RCxFQUFFLElBQU04RCxFQUNSOUQsRUFBRSxLQUFPNkQsRUFDVDdELEVBQUUsS0FBTzhELEVBQ1Q5RCxFQUFFLEtBQU82RCxFQUNUN0QsRUFBRSxLQUFPOEQsRUFDVDlELEVBQUUsS0FBTzZELEVBQ1Q3RCxFQUFFLEtBQU84RCxFQUNUOUQsRUFBRSxLQUFPNkQsRUFDVDdELEVBQUUsS0FBTzhELEVBRVRXLEVBQUt6RSxFQUFFLEdBQ1AwRSxFQUFLMUUsRUFBRSxHQUNQeUcsRUFBT3pHLEVBQUUsS0FBTyxFQUFNQSxFQUFFLE1BQVEsR0FDaEMwRyxFQUFPMUcsRUFBRSxLQUFPLEVBQU1BLEVBQUUsTUFBUSxHQUNoQ3VGLEVBQU92RixFQUFFLEtBQU8sRUFBTUEsRUFBRSxNQUFRLEdBQ2hDd0YsRUFBT3hGLEVBQUUsS0FBTyxFQUFNQSxFQUFFLE1BQVEsR0FDaEN1SCxHQUFPdkgsRUFBRSxLQUFPLEVBQU1BLEVBQUUsTUFBUSxHQUNoQ3dILEdBQU94SCxFQUFFLEtBQU8sRUFBTUEsRUFBRSxNQUFRLEdBQ2hDcUcsRUFBT3JHLEVBQUUsS0FBTyxHQUFPQSxFQUFFLE1BQVEsR0FDakNzRyxFQUFPdEcsRUFBRSxLQUFPLEdBQU9BLEVBQUUsTUFBUSxHQUNqQzZGLEVBQU83RixFQUFFLElBQU0sRUFBTUEsRUFBRSxLQUFPLEdBQzlCOEYsRUFBTzlGLEVBQUUsSUFBTSxFQUFNQSxFQUFFLEtBQU8sR0FDOUIyRSxFQUFNM0UsRUFBRSxLQUFPLEdBQU9BLEVBQUUsTUFBUSxHQUNoQzRFLEVBQU01RSxFQUFFLEtBQU8sR0FBT0EsRUFBRSxNQUFRLEdBQ2hDMkcsRUFBTzNHLEVBQUUsS0FBTyxHQUFPQSxFQUFFLE1BQVEsR0FDakM0RyxFQUFPNUcsRUFBRSxLQUFPLEdBQU9BLEVBQUUsTUFBUSxHQUNqQ3lGLEVBQU96RixFQUFFLEtBQU8sR0FBT0EsRUFBRSxNQUFRLEdBQ2pDMEYsRUFBTzFGLEVBQUUsS0FBTyxHQUFPQSxFQUFFLE1BQVEsR0FDakN5SCxHQUFPekgsRUFBRSxLQUFPLEVBQU1BLEVBQUUsTUFBUSxHQUNoQzBILEdBQU8xSCxFQUFFLEtBQU8sRUFBTUEsRUFBRSxNQUFRLEdBQ2hDaUgsR0FBT2pILEVBQUUsSUFBTSxHQUFPQSxFQUFFLEtBQU8sRUFDL0JrSCxHQUFPbEgsRUFBRSxJQUFNLEdBQU9BLEVBQUUsS0FBTyxFQUMvQitGLEVBQU8vRixFQUFFLEtBQU8sRUFBTUEsRUFBRSxNQUFRLEdBQ2hDZ0csRUFBT2hHLEVBQUUsS0FBTyxFQUFNQSxFQUFFLE1BQVEsR0FDaEM2RSxFQUFNN0UsRUFBRSxLQUFPLEdBQU9BLEVBQUUsTUFBUSxHQUNoQzhFLEVBQU05RSxFQUFFLEtBQU8sR0FBT0EsRUFBRSxNQUFRLEdBQ2hDNkcsRUFBTzdHLEVBQUUsS0FBTyxHQUFPQSxFQUFFLE1BQVEsR0FDakM4RyxFQUFPOUcsRUFBRSxLQUFPLEdBQU9BLEVBQUUsTUFBUSxHQUNqQzJGLEVBQU8zRixFQUFFLEtBQU8sR0FBT0EsRUFBRSxNQUFRLEVBQ2pDNEYsRUFBTzVGLEVBQUUsS0FBTyxHQUFPQSxFQUFFLE1BQVEsRUFDakNtRixFQUFPbkYsRUFBRSxJQUFNLEdBQU9BLEVBQUUsS0FBTyxFQUMvQm9GLEVBQU9wRixFQUFFLElBQU0sR0FBT0EsRUFBRSxLQUFPLEVBQy9CbUgsR0FBT25ILEVBQUUsS0FBTyxHQUFPQSxFQUFFLE1BQVEsRUFDakNvSCxHQUFPcEgsRUFBRSxLQUFPLEdBQU9BLEVBQUUsTUFBUSxFQUNqQ2lHLEVBQU9qRyxFQUFFLEtBQU8sR0FBT0EsRUFBRSxNQUFRLEVBQ2pDa0csRUFBT2xHLEVBQUUsS0FBTyxHQUFPQSxFQUFFLE1BQVEsRUFDakMrRSxFQUFNL0UsRUFBRSxLQUFPLEdBQU9BLEVBQUUsTUFBUSxHQUNoQ2dGLEVBQU1oRixFQUFFLEtBQU8sR0FBT0EsRUFBRSxNQUFRLEdBQ2hDK0csRUFBTy9HLEVBQUUsS0FBTyxHQUFPQSxFQUFFLE1BQVEsRUFDakNnSCxHQUFPaEgsRUFBRSxLQUFPLEdBQU9BLEVBQUUsTUFBUSxFQUNqQ3VHLEVBQU92RyxFQUFFLElBQU0sR0FBT0EsRUFBRSxLQUFPLEVBQy9Cd0csRUFBT3hHLEVBQUUsSUFBTSxHQUFPQSxFQUFFLEtBQU8sRUFDL0JxRixFQUFPckYsRUFBRSxLQUFPLEdBQU9BLEVBQUUsTUFBUSxHQUNqQ3NGLEVBQU90RixFQUFFLEtBQU8sR0FBT0EsRUFBRSxNQUFRLEdBQ2pDcUgsR0FBT3JILEVBQUUsS0FBTyxFQUFNQSxFQUFFLE1BQVEsR0FDaENzSCxHQUFPdEgsRUFBRSxLQUFPLEVBQU1BLEVBQUUsTUFBUSxHQUNoQ21HLEVBQU9uRyxFQUFFLEtBQU8sRUFBTUEsRUFBRSxNQUFRLEdBQ2hDb0csRUFBT3BHLEVBQUUsS0FBTyxFQUFNQSxFQUFFLE1BQVEsR0FDaENpRixFQUFNakYsRUFBRSxLQUFPLEdBQU9BLEVBQUUsTUFBUSxHQUNoQ2tGLEVBQU1sRixFQUFFLEtBQU8sR0FBT0EsRUFBRSxNQUFRLEdBRWhDQSxFQUFFLEdBQUt5RSxHQUFPRSxFQUFLRSxFQUNuQjdFLEVBQUUsR0FBSzBFLEdBQU9FLEVBQUtFLEVBQ25COUUsRUFBRSxJQUFNbUYsR0FBUUUsRUFBTUUsRUFDdEJ2RixFQUFFLElBQU1vRixHQUFRRSxFQUFNRSxFQUN0QnhGLEVBQUUsSUFBTTZGLEdBQVFFLEVBQU1FLEVBQ3RCakcsRUFBRSxJQUFNOEYsR0FBUUUsRUFBTUUsRUFDdEJsRyxFQUFFLElBQU11RyxHQUFRRSxFQUFNRSxFQUN0QjNHLEVBQUUsSUFBTXdHLEdBQVFFLEVBQU1FLEVBQ3RCNUcsRUFBRSxJQUFNaUgsSUFBUUUsR0FBTUUsR0FDdEJySCxFQUFFLElBQU1rSCxJQUFRRSxHQUFNRSxHQUN0QnRILEVBQUUsR0FBSzJFLEdBQU9FLEVBQUtFLEVBQ25CL0UsRUFBRSxHQUFLNEUsR0FBT0UsRUFBS0UsRUFDbkJoRixFQUFFLElBQU1xRixHQUFRRSxFQUFNRSxFQUN0QnpGLEVBQUUsSUFBTXNGLEdBQVFFLEVBQU1FLEVBQ3RCMUYsRUFBRSxJQUFNK0YsR0FBUUUsRUFBTUUsRUFDdEJuRyxFQUFFLElBQU1nRyxHQUFRRSxFQUFNRSxFQUN0QnBHLEVBQUUsSUFBTXlHLEdBQVFFLEVBQU1FLEVBQ3RCN0csRUFBRSxJQUFNMEcsR0FBUUUsRUFBTUUsRUFDdEI5RyxFQUFFLElBQU1tSCxJQUFRRSxHQUFNRSxHQUN0QnZILEVBQUUsSUFBTW9ILElBQVFFLEdBQU1FLEdBQ3RCeEgsRUFBRSxHQUFLNkUsR0FBT0UsRUFBS0UsRUFDbkJqRixFQUFFLEdBQUs4RSxHQUFPRSxFQUFLRSxFQUNuQmxGLEVBQUUsSUFBTXVGLEdBQVFFLEVBQU1FLEVBQ3RCM0YsRUFBRSxJQUFNd0YsR0FBUUUsRUFBTUUsRUFDdEI1RixFQUFFLElBQU1pRyxHQUFRRSxFQUFNRSxFQUN0QnJHLEVBQUUsSUFBTWtHLEdBQVFFLEVBQU1FLEVBQ3RCdEcsRUFBRSxJQUFNMkcsR0FBUUUsRUFBTUUsRUFDdEIvRyxFQUFFLElBQU00RyxHQUFRRSxFQUFNRSxHQUN0QmhILEVBQUUsSUFBTXFILElBQVFFLEdBQU1FLEdBQ3RCekgsRUFBRSxJQUFNc0gsSUFBUUUsR0FBTUUsR0FDdEIxSCxFQUFFLEdBQUsrRSxHQUFPRSxFQUFLUixFQUNuQnpFLEVBQUUsR0FBS2dGLEdBQU9FLEVBQUtSLEVBQ25CMUUsRUFBRSxJQUFNeUYsR0FBUUUsRUFBTVIsRUFDdEJuRixFQUFFLElBQU0wRixHQUFRRSxFQUFNUixFQUN0QnBGLEVBQUUsSUFBTW1HLEdBQVFFLEVBQU1SLEVBQ3RCN0YsRUFBRSxJQUFNb0csR0FBUUUsRUFBTVIsRUFDdEI5RixFQUFFLElBQU02RyxHQUFRRSxFQUFNUixFQUN0QnZHLEVBQUUsSUFBTThHLEdBQVFFLEdBQU1SLEVBQ3RCeEcsRUFBRSxJQUFNdUgsSUFBUUUsR0FBTVIsR0FDdEJqSCxFQUFFLElBQU13SCxJQUFRRSxHQUFNUixHQUN0QmxILEVBQUUsR0FBS2lGLEdBQU9SLEVBQUtFLEVBQ25CM0UsRUFBRSxHQUFLa0YsR0FBT1IsRUFBS0UsRUFDbkI1RSxFQUFFLElBQU0yRixHQUFRUixFQUFNRSxFQUN0QnJGLEVBQUUsSUFBTTRGLEdBQVFSLEVBQU1FLEVBQ3RCdEYsRUFBRSxJQUFNcUcsR0FBUVIsRUFBTUUsRUFDdEIvRixFQUFFLElBQU1zRyxHQUFRUixFQUFNRSxFQUN0QmhHLEVBQUUsSUFBTStHLEdBQVFSLEVBQU1FLEVBQ3RCekcsRUFBRSxJQUFNZ0gsSUFBUVIsRUFBTUUsRUFDdEIxRyxFQUFFLElBQU15SCxJQUFRUixHQUFNRSxHQUN0Qm5ILEVBQUUsSUFBTTBILElBQVFSLEdBQU1FLEdBRXRCcEgsRUFBRSxJQUFNN0IsRUFBRzRCLEdBQ1hDLEVBQUUsSUFBTTdCLEVBQUc0QixFQUFJLElBSXZCLElBQUssSUFBSVEsRUFBSSxFQUFHQSxFQUFJWSxFQUFZWCxTQUFVRCxFQUN0Qy9DLE9BQU8yRCxFQUFZWixJQUFNTixFQUFRa0IsRUFBWVosSUF4bkJyRCJ9"},
            'sjcl.js': {"requiresElectron":true,"requiresBrowser":false,"code":"\"use strict\";var sjcl={cipher:{},hash:{},keyexchange:{},mode:{},misc:{},codec:{},exception:{corrupt(t){this.toString=function(){return`CORRUPT: ${this.message}`},this.message=t},invalid(t){this.toString=function(){return`INVALID: ${this.message}`},this.message=t},bug(t){this.toString=function(){return`BUG: ${this.message}`},this.message=t},notReady(t){this.toString=function(){return`NOT READY: ${this.message}`},this.message=t}}};function t(t,e,s){if(4!==e.length)throw new sjcl.exception.invalid(\"invalid aes block size\");let i=t.b[s],c=e[0]^i[0],r=e[s?3:1]^i[1],o=e[2]^i[2];e=e[s?1:3]^i[3];let n,a,l,h=i.length/4-2,d,p=4,u=[0,0,0,0];t=(n=t.s[s])[0];let f=n[1],m=n[2],j=n[3],y=n[4];for(d=0;d<h;d++)n=t[c>>>24]^f[r>>16&255]^m[o>>8&255]^j[255&e]^i[p],a=t[r>>>24]^f[o>>16&255]^m[e>>8&255]^j[255&c]^i[p+1],l=t[o>>>24]^f[e>>16&255]^m[c>>8&255]^j[255&r]^i[p+2],e=t[e>>>24]^f[c>>16&255]^m[r>>8&255]^j[255&o]^i[p+3],p+=4,c=n,r=a,o=l;for(d=0;4>d;d++)u[s?3&-d:d]=y[c>>>24]<<24^y[r>>16&255]<<16^y[o>>8&255]<<8^y[255&e]^i[p++],n=c,c=r,r=o,o=e,e=n;return u}function u(t,e){let s,i,c,r=t.F,o=t.b,n=r[0],a=r[1],l=r[2],h=r[3],d=r[4],p=r[5],u=r[6],f=r[7];for(s=0;64>s;s++)16>s?i=e[s]:(i=e[s+1&15],c=e[s+14&15],i=e[15&s]=(i>>>7^i>>>18^i>>>3^i<<25^i<<14)+(c>>>17^c>>>19^c>>>10^c<<15^c<<13)+e[15&s]+e[s+9&15]|0),i=i+f+(d>>>6^d>>>11^d>>>25^d<<26^d<<21^d<<7)+(u^d&(p^u))+o[s],f=u,u=p,p=d,d=h+i|0,h=l,l=a,n=i+((a=n)&l^h&(a^l))+(a>>>2^a>>>13^a>>>22^a<<30^a<<19^a<<10)|0;r[0]=r[0]+n|0,r[1]=r[1]+a|0,r[2]=r[2]+l|0,r[3]=r[3]+h|0,r[4]=r[4]+d|0,r[5]=r[5]+p|0,r[6]=r[6]+u|0,r[7]=r[7]+f|0}function A(t,e){let s,i=sjcl.random.K[t],c=[];for(s in i)i.hasOwnProperty(s)&&c.push(i[s]);for(s=0;s<c.length;s++)c[s](e)}function C(t,e){\"undefined\"!=typeof window&&window.performance&&\"function\"==typeof window.performance.now?t.addEntropy(window.performance.now(),e,\"loadtime\"):t.addEntropy((new Date).valueOf(),e,\"loadtime\")}function y(t){t.b=z(t).concat(z(t)),t.L=new sjcl.cipher.aes(t.b)}function z(t){for(let e=0;4>e&&(t.h[e]=t.h[e]+1|0,!t.h[e]);e++);return t.L.encrypt(t.h)}function B(t,e){return function(){e.apply(t,arguments)}}sjcl.cipher.aes=function(t){this.s[0][0][0]||this.O();let e,s,i,c,r=this.s[0][4],o=this.s[1],n=1;if(4!==(e=t.length)&&6!==e&&8!==e)throw new sjcl.exception.invalid(\"invalid aes key size\");for(this.b=[i=t.slice(0),c=[]],t=e;t<4*e+28;t++)s=i[t-1],(0==t%e||8===e&&4==t%e)&&(s=r[s>>>24]<<24^r[s>>16&255]<<16^r[s>>8&255]<<8^r[255&s],0==t%e&&(s=s<<8^s>>>24^n<<24,n=n<<1^283*(n>>7))),i[t]=i[t-e]^s;for(e=0;t;e++,t--)s=i[3&e?t:t-4],c[e]=4>=t||4>e?s:o[0][r[s>>>24]]^o[1][r[s>>16&255]]^o[2][r[s>>8&255]]^o[3][r[255&s]]},sjcl.cipher.aes.prototype={encrypt(e){return t(this,e,0)},decrypt(e){return t(this,e,1)},s:[[[],[],[],[],[]],[[],[],[],[],[]]],O(){let t=this.s[0],e=this.s[1],s=t[4],i=e[4],c,r,o,n=[],a=[],l,h,d,p;for(c=0;256>c;c++)a[(n[c]=c<<1^283*(c>>7))^c]=c;for(r=o=0;!s[r];r^=l||1,o=a[o]||1)for(d=(d=o^o<<1^o<<2^o<<3^o<<4)>>8^255&d^99,s[r]=d,i[d]=r,p=16843009*(h=n[c=n[l=n[r]]])^65537*c^257*l^16843008*r,h=257*n[d]^16843008*d,c=0;4>c;c++)t[c][r]=h=h<<24^h>>>8,e[c][d]=p=p<<24^p>>>8;for(c=0;5>c;c++)t[c]=t[c].slice(0),e[c]=e[c].slice(0)}},sjcl.bitArray={bitSlice(t,e,s){return t=sjcl.bitArray.$(t.slice(e/32),32-(31&e)).slice(1),void 0===s?t:sjcl.bitArray.clamp(t,s-e)},extract(t,e,s){let i=Math.floor(-e-s&31);return(-32&(e+s-1^e)?t[e/32|0]<<32-i^t[e/32+1|0]>>>i:t[e/32|0]>>>i)&(1<<s)-1},concat(t,e){if(0===t.length||0===e.length)return t.concat(e);let s=t[t.length-1],i=sjcl.bitArray.getPartial(s);return 32===i?t.concat(e):sjcl.bitArray.$(e,i,0|s,t.slice(0,t.length-1))},bitLength(t){let e=t.length;return 0===e?0:32*(e-1)+sjcl.bitArray.getPartial(t[e-1])},clamp(t,e){if(32*t.length<e)return t;let s=(t=t.slice(0,Math.ceil(e/32))).length;return e&=31,0<s&&e&&(t[s-1]=sjcl.bitArray.partial(e,t[s-1]&2147483648>>e-1,1)),t},partial(t,e,s){return 32===t?e:(s?0|e:e<<32-t)+1099511627776*t},getPartial(t){return Math.round(t/1099511627776)||32},equal(t,e){if(sjcl.bitArray.bitLength(t)!==sjcl.bitArray.bitLength(e))return!1;let s=0,i;for(i=0;i<t.length;i++)s|=t[i]^e[i];return 0===s},$(t,e,s,i){let c;for(void 0===i&&(i=[]);32<=e;e-=32)i.push(s),s=0;if(0===e)return i.concat(t);for(c=0;c<t.length;c++)i.push(s|t[c]>>>e),s=t[c]<<32-e;return c=t.length?t[t.length-1]:0,t=sjcl.bitArray.getPartial(c),i.push(sjcl.bitArray.partial(e+t&31,32<e+t?s:i.pop(),1)),i},i(t,e){return[t[0]^e[0],t[1]^e[1],t[2]^e[2],t[3]^e[3]]},byteswapM(t){let e,s;for(e=0;e<t.length;++e)s=t[e],t[e]=s>>>24|s>>>8&65280|(65280&s)<<8|s<<24;return t}},sjcl.codec.utf8String={fromBits(t){let e=\"\",s=sjcl.bitArray.bitLength(t),i,c;for(i=0;i<s/8;i++)0==(3&i)&&(c=t[i/4]),e+=String.fromCharCode(c>>>8>>>8>>>8),c<<=8;return decodeURIComponent(encodeURI(e))},toBits(t){t=unescape(encodeURIComponent(t));let e=[],s,i=0;for(s=0;s<t.length;s++)i=i<<8|t.charCodeAt(s),3==(3&s)&&(e.push(i),i=0);return 3&s&&e.push(sjcl.bitArray.partial(8*(3&s),i)),e}},sjcl.codec.hex={fromBits(t){let e=\"\",s;for(s=0;s<t.length;s++)e+=(0xf00000000000+(0|t[s])).toString(16).substr(4);return e.substr(0,sjcl.bitArray.bitLength(t)/4)},toBits(t){let e,s=[],i;for(i=(t=t.replace(/\\s|0x/g,\"\")).length,t+=\"00000000\",e=0;e<t.length;e+=8)s.push(0^parseInt(t.substr(e,8),16));return sjcl.bitArray.clamp(s,4*i)}},sjcl.codec.base32={B:\"ABCDEFGHIJKLMNOPQRSTUVWXYZ234567\",X:\"0123456789ABCDEFGHIJKLMNOPQRSTUV\",BITS:32,BASE:5,REMAINING:27,fromBits(t,e,s){let i=sjcl.codec.base32.BASE,c=sjcl.codec.base32.REMAINING,r=\"\",o=0,n=s?sjcl.codec.base32.X:sjcl.codec.base32.B,a=0,l=sjcl.bitArray.bitLength(t);for(s=0;r.length*i<l;)r+=n.charAt((a^t[s]>>>o)>>>c),o<i?(a=t[s]<<i-o,o+=c,s++):(a<<=i,o-=i);for(;7&r.length&&!e;)r+=\"=\";return r},toBits(t,e){t=t.replace(/\\s|=/g,\"\").toUpperCase();let s=sjcl.codec.base32.BITS,i=sjcl.codec.base32.BASE,c=sjcl.codec.base32.REMAINING,r=[],o,n=0,a=e?sjcl.codec.base32.X:sjcl.codec.base32.B,l=0,h,d=e?\"base32hex\":\"base32\";for(o=0;o<t.length;o++){if(0>(h=a.indexOf(t.charAt(o)))){if(!e)try{return sjcl.codec.base32hex.toBits(t)}catch(t){}throw new sjcl.exception.invalid(\"this isn't \"+d+\"!\")}n>c?(n-=c,r.push(l^h>>>n),l=h<<s-n):l^=h<<s-(n+=i)}return 56&n&&r.push(sjcl.bitArray.partial(56&n,l,1)),r}},sjcl.codec.base32hex={fromBits(t,e){return sjcl.codec.base32.fromBits(t,e,1)},toBits(t){return sjcl.codec.base32.toBits(t,1)}},sjcl.codec.base64={B:\"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\",fromBits(t,e,s){let i=\"\",c=0,r=sjcl.codec.base64.B,o=0,n=sjcl.bitArray.bitLength(t);for(s&&(r=`${r.substr(0,62)}-_`),s=0;6*i.length<n;)i+=r.charAt((o^t[s]>>>c)>>>26),6>c?(o=t[s]<<6-c,c+=26,s++):(o<<=6,c-=6);for(;3&i.length&&!e;)i+=\"=\";return i},toBits(t,e){t=t.replace(/\\s|=/g,\"\");let s=[],i,c=0,r=sjcl.codec.base64.B,o=0,n;for(e&&(r=r.substr(0,62)+\"-_\"),i=0;i<t.length;i++){if(0>(n=r.indexOf(t.charAt(i))))throw new sjcl.exception.invalid(\"this isn't base64!\");26<c?(c-=26,s.push(o^n>>>c),o=n<<32-c):o^=n<<32-(c+=6)}return 56&c&&s.push(sjcl.bitArray.partial(56&c,o,1)),s}},sjcl.codec.base64url={fromBits(t){return sjcl.codec.base64.fromBits(t,1,1)},toBits(t){return sjcl.codec.base64.toBits(t,1)}},sjcl.codec.bytes={fromBits(t){let e=[],s=sjcl.bitArray.bitLength(t),i,c;for(i=0;i<s/8;i++)0==(3&i)&&(c=t[i/4]),e.push(c>>>24),c<<=8;return e},toBits(t){let e=[],s,i=0;for(s=0;s<t.length;s++)i=i<<8|t[s],3==(3&s)&&(e.push(i),i=0);return 3&s&&e.push(sjcl.bitArray.partial(8*(3&s),i)),e}},sjcl.hash.sha256=function(t){this.b[0]||this.O(),t?(this.F=t.F.slice(0),this.A=t.A.slice(0),this.l=t.l):this.reset()},sjcl.hash.sha256.hash=function(t){return(new sjcl.hash.sha256).update(t).finalize()},sjcl.hash.sha256.prototype={blockSize:512,reset(){return this.F=this.Y.slice(0),this.A=[],this.l=0,this},update(t){\"string\"==typeof t&&(t=sjcl.codec.utf8String.toBits(t));let e,s=this.A=sjcl.bitArray.concat(this.A,t);if(e=this.l,9007199254740991<(t=this.l=e+sjcl.bitArray.bitLength(t)))throw new sjcl.exception.invalid(\"Cannot hash more than 2^53 - 1 bits\");if(\"undefined\"!=typeof Uint32Array){let i=new Uint32Array(s),c=0;for(e=512+e-(512+e&511);e<=t;e+=512)u(this,i.subarray(16*c,16*(c+1))),c+=1;s.splice(0,16*c)}else for(e=512+e-(512+e&511);e<=t;e+=512)u(this,s.splice(0,16));return this},finalize(){let t,e=sjcl.bitArray.concat(this.A,[sjcl.bitArray.partial(1,1)]),s=this.F;for(t=e.length+2;15&t;t++)e.push(0);for(e.push(Math.floor(this.l/4294967296)),e.push(0|this.l);e.length;)u(this,e.splice(0,16));return this.reset(),s},Y:[],b:[],O(){function t(t){return 4294967296*(t-Math.floor(t))|0}for(let e=0,s=2,i,c;64>e;s++){for(c=!0,i=2;i*i<=s;i++)if(0==s%i){c=!1;break}c&&(8>e&&(this.Y[e]=t(Math.pow(s,.5))),this.b[e]=t(Math.pow(s,1/3)),e++)}}},sjcl.hash.sha512=function(t){this.b[0]||this.q(),t?(this.e=t.e.slice(0),this.d=t.d.slice(0),this.c=t.c):this.reset()},sjcl.hash.sha512.hash=function(t){return(new sjcl.hash.sha512).update(t).finalize()},sjcl.hash.sha512.prototype={blockSize:1024,reset(){return this.e=this.i.slice(0),this.d=[],this.c=0,this},update(t){\"string\"==typeof t&&(t=sjcl.codec.utf8String.toBits(t));let e,s=this.d=sjcl.bitArray.concat(this.d,t);for(e=this.c,t=this.c=e+sjcl.bitArray.bitLength(t),e=1024+e&-1024;e<=t;e+=1024)this.n(s.splice(0,32));return this},finalize(){let t,e=sjcl.bitArray.concat(this.d,[sjcl.bitArray.partial(1,1)]),s=this.e;for(t=e.length+4;31&t;t++)e.push(0);for(e.push(0),e.push(0),e.push(Math.floor(this.c/4294967296)),e.push(0|this.c);e.length;)this.n(e.splice(0,32));return this.reset(),s},i:[],T:[12372232,13281083,9762859,1914609,15106769,4090911,4308331,8266105],b:[],V:[2666018,15689165,5061423,9034684,4764984,380953,1658779,7176472,197186,7368638,14987916,16757986,8096111,1480369,13046325,6891156,15813330,5187043,9229749,11312229,2818677,10937475,4324308,1135541,6741931,11809296,16458047,15666916,11046850,698149,229999,945776,13774844,2541862,12856045,9810911,11494366,7844520,15576806,8533307,15795044,4337665,16291729,5553712,15684120,6662416,7413802,12308920,13816008,4303699,9366425,10176680,13195875,4295371,6546291,11712675,15708924,1519456,15772530,6568428,6495784,8568297,13007125,7492395,2515356,12632583,14740254,7262584,1535930,13146278,16321966,1853211,294276,13051027,13221564,1051980,4080310,6651434,14088940,4675607],q(){function t(t){return 4294967296*(t-Math.floor(t))|0}function e(t){return 1099511627776*(t-Math.floor(t))&255}let s=0,i=2,c;t:for(;80>s;i++){for(c=2;c*c<=i;c++)if(0==i%c)continue t;8>s&&(this.i[2*s]=t(Math.pow(i,.5)),this.i[2*s+1]=e(Math.pow(i,.5))<<24|this.T[s]),this.b[2*s]=t(Math.pow(i,1/3)),this.b[2*s+1]=e(Math.pow(i,1/3))<<24|this.V[s],s++}},n(t){let e,s,i=t.slice(0),c=this.e,r=this.b,o=c[0],n=c[1],a=c[2],l=c[3],h=c[4],d=c[5],p=c[6],u=c[7],f=c[8],m=c[9],j=c[10],y=c[11],g=c[12],b=c[13],w=c[14],v=c[15],A=o,B=n,k=a,C=l,L=h,x=d,E=p,S=u,M=f,R=m,I=j,P=y,z=g,O=b,U=w,T=v;for(t=0;80>t;t++){if(16>t)e=i[2*t],s=i[2*t+1];else{var G;s=i[2*(t-15)],e=((G=i[2*(t-15)+1])<<31|s>>>1)^(G<<24|s>>>8)^s>>>7;let c=(s<<31|G>>>1)^(s<<24|G>>>8)^(s<<25|G>>>7);s=i[2*(t-2)];var D,G=((D=i[2*(t-2)+1])<<13|s>>>19)^(s<<3|D>>>29)^s>>>6,D=(s<<13|D>>>19)^(D<<3|s>>>29)^(s<<26|D>>>6),N=i[2*(t-7)],$=i[2*(t-16)],V=i[2*(t-16)+1];e=e+N+((s=c+i[2*(t-7)+1])>>>0<c>>>0?1:0),e+=G+((s+=D)>>>0<D>>>0?1:0),e+=$+((s+=V)>>>0<V>>>0?1:0)}i[2*t]=e|=0,i[2*t+1]=s|=0;var N=M&I^~M&z,q=R&P^~R&O,D=A&k^A&L^k&L,Y=B&C^B&x^C&x,$=(B<<4|A>>>28)^(A<<30|B>>>2)^(A<<25|B>>>7),V=(A<<4|B>>>28)^(B<<30|A>>>2)^(B<<25|A>>>7),K=r[2*t],X=r[2*t+1],G,F,G,F,G,F,G,F=(F=(F=(F=U+((R<<18|M>>>14)^(R<<14|M>>>18)^(M<<23|R>>>9))+((G=T+((M<<18|R>>>14)^(M<<14|R>>>18)^(R<<23|M>>>9)))>>>0<T>>>0?1:0))+(N+((G=G+q)>>>0<q>>>0?1:0)))+(K+((G=G+X)>>>0<X>>>0?1:0)))+(e+((G=G+s|0)>>>0<s>>>0?1:0));e=$+D+((s=V+Y)>>>0<V>>>0?1:0),U=z,T=O,z=I,O=P,I=M,P=R,M=E+F+((R=S+G|0)>>>0<S>>>0?1:0)|0,E=L,S=x,L=k,x=C,k=A,C=B,A=F+e+((B=G+s|0)>>>0<G>>>0?1:0)|0}n=c[1]=n+B|0,c[0]=o+A+(n>>>0<B>>>0?1:0)|0,l=c[3]=l+C|0,c[2]=a+k+(l>>>0<C>>>0?1:0)|0,d=c[5]=d+x|0,c[4]=h+L+(d>>>0<x>>>0?1:0)|0,u=c[7]=u+S|0,c[6]=p+E+(u>>>0<S>>>0?1:0)|0,m=c[9]=m+R|0,c[8]=f+M+(m>>>0<R>>>0?1:0)|0,y=c[11]=y+P|0,c[10]=j+I+(y>>>0<P>>>0?1:0)|0,b=c[13]=b+O|0,c[12]=g+z+(b>>>0<O>>>0?1:0)|0,v=c[15]=v+T|0,c[14]=w+U+(v>>>0<T>>>0?1:0)|0}},sjcl.mode.ccm={name:\"ccm\",G:[],listenProgress(t){sjcl.mode.ccm.G.push(t)},unListenProgress(t){-1<(t=sjcl.mode.ccm.G.indexOf(t))&&sjcl.mode.ccm.G.splice(t,1)},fa(t){let e=sjcl.mode.ccm.G.slice(),s;for(s=0;s<e.length;s+=1)e[s](t)},encrypt(t,e,s,i,c){let r,o=e.slice(0),n=sjcl.bitArray,a=n.bitLength(s)/8,l=n.bitLength(o)/8;if(c=c||64,i=i||[],7>a)throw new sjcl.exception.invalid(\"ccm: iv must be at least 7 bytes\");for(r=2;4>r&&l>>>8*r;r++);return r<15-a&&(r=15-a),s=n.clamp(s,8*(15-r)),e=sjcl.mode.ccm.V(t,e,s,i,c,r),o=sjcl.mode.ccm.C(t,o,s,e,c,r),n.concat(o.data,o.tag)},decrypt(t,e,s,i,c){c=c||64,i=i||[];let r=sjcl.bitArray,o=r.bitLength(s)/8,n=r.bitLength(e),a=r.clamp(e,n-c),l=r.bitSlice(e,n-c);if(n=(n-c)/8,7>o)throw new sjcl.exception.invalid(\"ccm: iv must be at least 7 bytes\");for(e=2;4>e&&n>>>8*e;e++);if(e<15-o&&(e=15-o),s=r.clamp(s,8*(15-e)),a=sjcl.mode.ccm.C(t,a,s,l,c,e),t=sjcl.mode.ccm.V(t,a.data,s,i,c,e),!r.equal(a.tag,t))throw new sjcl.exception.corrupt(\"ccm: tag doesn't match\");return a.data},na(t,e,s,i,c,r){let o=[],n=sjcl.bitArray,a=n.i;if(i=[n.partial(8,(e.length?64:0)|i-2<<2|r-1)],(i=n.concat(i,s))[3]|=c,i=t.encrypt(i),e.length)for(65279>=(s=n.bitLength(e)/8)?o=[n.partial(16,s)]:4294967295>=s&&(o=n.concat([n.partial(16,65534)],[s])),o=n.concat(o,e),e=0;e<o.length;e+=4)i=t.encrypt(a(i,o.slice(e,e+4).concat([0,0,0])));return i},V(t,e,s,i,c,r){let o=sjcl.bitArray,n=o.i;if((c/=8)%2||4>c||16<c)throw new sjcl.exception.invalid(\"ccm: invalid tag length\");if(4294967295<i.length||4294967295<e.length)throw new sjcl.exception.bug(\"ccm: can't deal with 4GiB or more data\");for(s=sjcl.mode.ccm.na(t,i,s,c,o.bitLength(e)/8,r),i=0;i<e.length;i+=4)s=t.encrypt(n(s,e.slice(i,i+4).concat([0,0,0])));return o.clamp(s,8*c)},C(t,e,s,i,c,r){let o,n=sjcl.bitArray;o=n.i;let a=e.length,l=n.bitLength(e),h=a/50,d=h;if(s=n.concat([n.partial(8,r-1)],s).concat([0,0,0]).slice(0,4),i=n.bitSlice(o(i,t.encrypt(s)),0,c),!a)return{tag:i,data:[]};for(o=0;o<a;o+=4)o>h&&(sjcl.mode.ccm.fa(o/a),h+=d),s[3]++,c=t.encrypt(s),e[o]^=c[0],e[o+1]^=c[1],e[o+2]^=c[2],e[o+3]^=c[3];return{tag:i,data:n.clamp(e,l)}}},sjcl.mode.ocb2={name:\"ocb2\",encrypt(t,e,s,i,c,r){if(128!==sjcl.bitArray.bitLength(s))throw new sjcl.exception.invalid(\"ocb iv must be 128 bits\");let o,n=sjcl.mode.ocb2.S,a=sjcl.bitArray,l=a.i,h=[0,0,0,0];s=n(t.encrypt(s));let d,p=[];for(i=i||[],c=c||64,o=0;o+4<e.length;o+=4)h=l(h,d=e.slice(o,o+4)),p=p.concat(l(s,t.encrypt(l(s,d)))),s=n(s);return d=e.slice(o),e=a.bitLength(d),o=t.encrypt(l(s,[0,0,0,e])),h=l(h,l((d=a.clamp(l(d.concat([0,0,0]),o),e)).concat([0,0,0]),o)),h=t.encrypt(l(h,l(s,n(s)))),i.length&&(h=l(h,r?i:sjcl.mode.ocb2.pmac(t,i))),p.concat(a.concat(d,a.clamp(h,c)))},decrypt(t,e,s,i,c,r){if(128!==sjcl.bitArray.bitLength(s))throw new sjcl.exception.invalid(\"ocb iv must be 128 bits\");c=c||64;let o=sjcl.mode.ocb2.S,n=sjcl.bitArray,a=n.i,l=[0,0,0,0],h=o(t.encrypt(s)),d,p,u=sjcl.bitArray.bitLength(e)-c,f=[];for(i=i||[],s=0;s+4<u/32;s+=4)l=a(l,d=a(h,t.decrypt(a(h,e.slice(s,s+4))))),f=f.concat(d),h=o(h);if(p=u-32*s,l=a(l,d=a(d=t.encrypt(a(h,[0,0,0,p])),n.clamp(e.slice(s),p).concat([0,0,0]))),l=t.encrypt(a(l,a(h,o(h)))),i.length&&(l=a(l,r?i:sjcl.mode.ocb2.pmac(t,i))),!n.equal(n.clamp(l,c),n.bitSlice(e,u)))throw new sjcl.exception.corrupt(\"ocb: tag doesn't match\");return f.concat(n.clamp(d,p))},pmac(t,e){let s,i=sjcl.mode.ocb2.S,c=sjcl.bitArray,r=c.i,o=[0,0,0,0],n=t.encrypt([0,0,0,0]);for(n=r(n,i(i(n))),s=0;s+4<e.length;s+=4)n=i(n),o=r(o,t.encrypt(r(n,e.slice(s,s+4))));return s=e.slice(s),128>c.bitLength(s)&&(n=r(n,i(n)),s=c.concat(s,[-2147483648,0,0,0])),o=r(o,s),t.encrypt(r(i(r(n,i(n))),o))},S(t){return[t[0]<<1^t[1]>>>31,t[1]<<1^t[2]>>>31,t[2]<<1^t[3]>>>31,t[3]<<1^135*(t[0]>>>31)]}},sjcl.mode.gcm={name:\"gcm\",encrypt(t,e,s,i,c){let r=e.slice(0);return e=sjcl.bitArray,i=i||[],t=sjcl.mode.gcm.C(!0,t,r,i,s,c||128),e.concat(t.data,t.tag)},decrypt(t,e,s,i,c){let r=e.slice(0),o=sjcl.bitArray,n=o.bitLength(r);if(c=c||128,i=i||[],c<=n?(e=o.bitSlice(r,n-c),r=o.bitSlice(r,0,n-c)):(e=r,r=[]),t=sjcl.mode.gcm.C(!1,t,r,i,s,c),!o.equal(t.tag,e))throw new sjcl.exception.corrupt(\"gcm: tag doesn't match\");return t.data},ka(t,e){let s,i,c,r,o,n=sjcl.bitArray.i;for(c=[0,0,0,0],r=e.slice(0),s=0;128>s;s++){for((i=0!=(t[Math.floor(s/32)]&1<<31-s%32))&&(c=n(c,r)),o=0!=(1&r[3]),i=3;0<i;i--)r[i]=r[i]>>>1|(1&r[i-1])<<31;r[0]>>>=1,o&&(r[0]^=-520093696)}return c},j(t,e,s){let i,c=s.length;for(e=e.slice(0),i=0;i<c;i+=4)e[0]^=4294967295&s[i],e[1]^=4294967295&s[i+1],e[2]^=4294967295&s[i+2],e[3]^=4294967295&s[i+3],e=sjcl.mode.gcm.ka(e,t);return e},C(t,e,s,i,c,r){let o,n,a,l,h,d,p,u,f=sjcl.bitArray;for(d=s.length,p=f.bitLength(s),u=f.bitLength(i),n=f.bitLength(c),o=e.encrypt([0,0,0,0]),96===n?(c=c.slice(0),c=f.concat(c,[1])):(c=sjcl.mode.gcm.j(o,[0,0,0,0],c),c=sjcl.mode.gcm.j(o,c,[0,0,Math.floor(n/4294967296),4294967295&n])),n=sjcl.mode.gcm.j(o,[0,0,0,0],i),h=c.slice(0),i=n.slice(0),t||(i=sjcl.mode.gcm.j(o,n,s)),l=0;l<d;l+=4)h[3]++,a=e.encrypt(h),s[l]^=a[0],s[l+1]^=a[1],s[l+2]^=a[2],s[l+3]^=a[3];return s=f.clamp(s,p),t&&(i=sjcl.mode.gcm.j(o,n,s)),t=[Math.floor(u/4294967296),4294967295&u,Math.floor(p/4294967296),4294967295&p],i=sjcl.mode.gcm.j(o,i,t),a=e.encrypt(c),i[0]^=a[0],i[1]^=a[1],i[2]^=a[2],i[3]^=a[3],{tag:f.bitSlice(i,0,r),data:s}}},sjcl.misc.hmac=function(t,e){this.W=e=e||sjcl.hash.sha256;let s=[[],[]],i,c=e.prototype.blockSize/32;for(this.w=[new e,new e],t.length>c&&(t=e.hash(t)),i=0;i<c;i++)s[0][i]=909522486^t[i],s[1][i]=1549556828^t[i];this.w[0].update(s[0]),this.w[1].update(s[1]),this.R=new e(this.w[0])},sjcl.misc.hmac.prototype.encrypt=sjcl.misc.hmac.prototype.mac=function(t){if(this.aa)throw new sjcl.exception.invalid(\"encrypt on already updated hmac called!\");return this.update(t),this.digest(t)},sjcl.misc.hmac.prototype.reset=function(){this.R=new this.W(this.w[0]),this.aa=!1},sjcl.misc.hmac.prototype.update=function(t){this.aa=!0,this.R.update(t)},sjcl.misc.hmac.prototype.digest=function(){let t=new this.W(this.w[1]).update(this.R.finalize()).finalize();return this.reset(),t},sjcl.misc.pbkdf2=function(t,e,s,i,c){if(s=s||1e4,0>i||0>s)throw new sjcl.exception.invalid(\"invalid params to pbkdf2\");\"string\"==typeof t&&(t=sjcl.codec.utf8String.toBits(t)),\"string\"==typeof e&&(e=sjcl.codec.utf8String.toBits(e)),t=new(c=c||sjcl.misc.hmac)(t);let r,o,n,a,l=[],h=sjcl.bitArray;for(a=1;32*l.length<(i||1);a++){for(c=r=t.encrypt(h.concat(e,[a])),o=1;o<s;o++)for(r=t.encrypt(r),n=0;n<r.length;n++)c[n]^=r[n];l=l.concat(c)}return i&&(l=h.clamp(l,i)),l},sjcl.prng=function(t){this.c=[new sjcl.hash.sha256],this.m=[0],this.P=0,this.H={},this.N=0,this.U={},this.Z=this.f=this.o=this.ha=0,this.b=[0,0,0,0,0,0,0,0],this.h=[0,0,0,0],this.L=void 0,this.M=t,this.D=!1,this.K={progress:{},seeded:{}},this.u=this.ga=0,this.I=1,this.J=2,this.ca=65536,this.T=[0,48,64,96,128,192,256,384,512,768,1024],this.da=3e4,this.ba=80},sjcl.prng.prototype={randomWords(t,e){let s=[],i,c;if((i=this.isReady(e))===this.u)throw new sjcl.exception.notReady(\"generator isn't seeded\");if(i&this.J){i=!(i&this.I),c=[];let t=0,e;for(this.Z=c[0]=(new Date).valueOf()+this.da,e=0;16>e;e++)c.push(4294967296*Math.random()|0);for(e=0;e<this.c.length&&(c=c.concat(this.c[e].finalize()),t+=this.m[e],this.m[e]=0,i||!(this.P&1<<e));e++);for(this.P>=1<<this.c.length&&(this.c.push(new sjcl.hash.sha256),this.m.push(0)),this.f-=t,t>this.o&&(this.o=t),this.P++,this.b=sjcl.hash.sha256.hash(this.b.concat(c)),this.L=new sjcl.cipher.aes(this.b),i=0;4>i&&(this.h[i]=this.h[i]+1|0,!this.h[i]);i++);}for(i=0;i<t;i+=4)0==(i+1)%this.ca&&y(this),c=z(this),s.push(c[0],c[1],c[2],c[3]);return y(this),s.slice(0,t)},setDefaultParanoia(t,e){if(0===t&&\"Setting paranoia=0 will ruin your security; use it only for testing\"!==e)throw new sjcl.exception.invalid(\"Setting paranoia=0 will ruin your security; use it only for testing\");this.M=t},addEntropy(t,e,s){s=s||\"user\";let i,c,r=(new Date).valueOf(),o=this.H[s],n=this.isReady(),a=0;switch(void 0===(i=this.U[s])&&(i=this.U[s]=this.ha++),void 0===o&&(o=this.H[s]=0),this.H[s]=(this.H[s]+1)%this.c.length,typeof t){case\"number\":void 0===e&&(e=1),this.c[o].update([i,this.N++,1,e,r,1,0|t]);break;case\"object\":if(\"[object Uint32Array]\"===(s=Object.prototype.toString.call(t))){for(c=[],s=0;s<t.length;s++)c.push(t[s]);t=c}else for(\"[object Array]\"!==s&&(a=1),s=0;s<t.length&&!a;s++)\"number\"!=typeof t[s]&&(a=1);if(!a){if(void 0===e)for(s=e=0;s<t.length;s++)for(c=t[s];0<c;)e++,c>>>=1;this.c[o].update([i,this.N++,2,e,r,t.length].concat(t))}break;case\"string\":void 0===e&&(e=t.length),this.c[o].update([i,this.N++,3,e,r,t.length]),this.c[o].update(t);break;default:a=1}if(a)throw new sjcl.exception.bug(\"random: addEntropy only supports number, array of numbers or string\");this.m[o]+=e,this.f+=e,n===this.u&&(this.isReady()!==this.u&&A(\"seeded\",Math.max(this.o,this.f)),A(\"progress\",this.getProgress()))},isReady(t){return t=this.T[void 0!==t?t:this.M],this.o&&this.o>=t?this.m[0]>this.ba&&(new Date).valueOf()>this.Z?this.J|this.I:this.I:this.f>=t?this.J|this.u:this.u},getProgress(t){return t=this.T[t||this.M],this.o>=t?1:this.f>t?1:this.f/t},startCollectors(){if(!this.D){if(this.a={loadTimeCollector:B(this,this.ma),mouseCollector:B(this,this.oa),keyboardCollector:B(this,this.la),accelerometerCollector:B(this,this.ea),touchCollector:B(this,this.qa)},window.addEventListener)window.addEventListener(\"load\",this.a.loadTimeCollector,!1),window.addEventListener(\"mousemove\",this.a.mouseCollector,!1),window.addEventListener(\"keypress\",this.a.keyboardCollector,!1),window.addEventListener(\"devicemotion\",this.a.accelerometerCollector,!1),window.addEventListener(\"touchmove\",this.a.touchCollector,!1);else{if(!document.attachEvent)throw new sjcl.exception.bug(\"can't attach event\");document.attachEvent(\"onload\",this.a.loadTimeCollector),document.attachEvent(\"onmousemove\",this.a.mouseCollector),document.attachEvent(\"keypress\",this.a.keyboardCollector)}this.D=!0}},stopCollectors(){this.D&&(window.removeEventListener?(window.removeEventListener(\"load\",this.a.loadTimeCollector,!1),window.removeEventListener(\"mousemove\",this.a.mouseCollector,!1),window.removeEventListener(\"keypress\",this.a.keyboardCollector,!1),window.removeEventListener(\"devicemotion\",this.a.accelerometerCollector,!1),window.removeEventListener(\"touchmove\",this.a.touchCollector,!1)):document.detachEvent&&(document.detachEvent(\"onload\",this.a.loadTimeCollector),document.detachEvent(\"onmousemove\",this.a.mouseCollector),document.detachEvent(\"keypress\",this.a.keyboardCollector)),this.D=!1)},addEventListener(t,e){this.K[t][this.ga++]=e},removeEventListener(t,e){let s,i,c=this.K[t],r=[];for(i in c)c.hasOwnProperty(i)&&c[i]===e&&r.push(i);for(s=0;s<r.length;s++)delete c[i=r[s]]},la(){C(this,1)},oa(t){let e,s;try{e=t.x||t.clientX||t.offsetX||0,s=t.y||t.clientY||t.offsetY||0}catch(t){s=e=0}0!=e&&0!=s&&this.addEntropy([e,s],2,\"mouse\"),C(this,0)},qa(t){t=t.touches[0]||t.changedTouches[0],this.addEntropy([t.pageX||t.clientX,t.pageY||t.clientY],1,\"touch\"),C(this,0)},ma(){C(this,2)},ea(t){if(t=t.accelerationIncludingGravity.x||t.accelerationIncludingGravity.y||t.accelerationIncludingGravity.z,window.orientation){let t=window.orientation;\"number\"==typeof t&&this.addEntropy(t,1,\"accelerometer\")}t&&this.addEntropy(t,2,\"accelerometer\"),C(this,0)}},sjcl.random=new sjcl.prng(6);t:try{let t,e,s,i;if(i=\"undefined\"!=typeof module&&module.exports){let t;try{t=require(\"crypto\")}catch(e){t=null}i=e=t}if(i&&e.randomBytes)t=e.randomBytes(128),t=new Uint32Array(new Uint8Array(t).buffer),sjcl.random.addEntropy(t,1024,\"crypto['randomBytes']\");else if(\"undefined\"!=typeof window&&\"undefined\"!=typeof Uint32Array){if(s=new Uint32Array(32),window.crypto&&window.crypto.getRandomValues)window.crypto.getRandomValues(s);else{if(!window.msCrypto||!window.msCrypto.getRandomValues)break t;window.msCrypto.getRandomValues(s)}sjcl.random.addEntropy(s,1024,\"crypto['getRandomValues']\")}}catch(t){\"undefined\"!=typeof window&&window.console&&(console.log(\"There was an error collecting entropy from the browser:\"),console.log(t))}sjcl.json={defaults:{v:1,iter:1e4,ks:128,ts:64,mode:\"ccm\",adata:\"\",cipher:\"aes\"},ja(t,e,s,i){s=s||{},i=i||{};let c=sjcl.json,r=c.g({iv:sjcl.random.randomWords(4,0)},c.defaults),o;if(c.g(r,s),s=r.adata,\"string\"==typeof r.salt&&(r.salt=sjcl.codec.base64.toBits(r.salt)),\"string\"==typeof r.iv&&(r.iv=sjcl.codec.base64.toBits(r.iv)),!sjcl.mode[r.mode]||!sjcl.cipher[r.cipher]||\"string\"==typeof t&&100>=r.iter||64!==r.ts&&96!==r.ts&&128!==r.ts||128!==r.ks&&192!==r.ks&&256!==r.ks||2>r.iv.length||4<r.iv.length)throw new sjcl.exception.invalid(\"json encrypt: invalid parameters\");return\"string\"==typeof t?(t=(o=sjcl.misc.cachedPbkdf2(t,r)).key.slice(0,r.ks/32),r.salt=o.salt):sjcl.ecc&&t instanceof sjcl.ecc.elGamal.publicKey&&(o=t.kem(),r.kemtag=o.tag,t=o.key.slice(0,r.ks/32)),\"string\"==typeof e&&(e=sjcl.codec.utf8String.toBits(e)),\"string\"==typeof s&&(r.adata=s=sjcl.codec.utf8String.toBits(s)),o=new sjcl.cipher[r.cipher](t),c.g(i,r),i.key=t,r.ct=\"ccm\"===r.mode&&sjcl.arrayBuffer&&sjcl.arrayBuffer.ccm&&e instanceof ArrayBuffer?sjcl.arrayBuffer.ccm.encrypt(o,e,r.iv,s,r.ts):sjcl.mode[r.mode].encrypt(o,e,r.iv,s,r.ts),r},encrypt(t,e,s,i){let c=sjcl.json,r=c.ja.apply(c,arguments);return c.encode(r)},ia(t,e,s,i){s=s||{},i=i||{};let c=sjcl.json,r,o;if(r=(e=c.g(c.g(c.g({},c.defaults),e),s,!0)).adata,\"string\"==typeof e.salt&&(e.salt=sjcl.codec.base64.toBits(e.salt)),\"string\"==typeof e.iv&&(e.iv=sjcl.codec.base64.toBits(e.iv)),!sjcl.mode[e.mode]||!sjcl.cipher[e.cipher]||\"string\"==typeof t&&100>=e.iter||64!==e.ts&&96!==e.ts&&128!==e.ts||128!==e.ks&&192!==e.ks&&256!==e.ks||!e.iv||2>e.iv.length||4<e.iv.length)throw new sjcl.exception.invalid(\"json decrypt: invalid parameters\");return\"string\"==typeof t?(t=(o=sjcl.misc.cachedPbkdf2(t,e)).key.slice(0,e.ks/32),e.salt=o.salt):sjcl.ecc&&t instanceof sjcl.ecc.elGamal.secretKey&&(t=t.unkem(sjcl.codec.base64.toBits(e.kemtag)).slice(0,e.ks/32)),\"string\"==typeof r&&(r=sjcl.codec.utf8String.toBits(r)),o=new sjcl.cipher[e.cipher](t),r=\"ccm\"===e.mode&&sjcl.arrayBuffer&&sjcl.arrayBuffer.ccm&&e.ct instanceof ArrayBuffer?sjcl.arrayBuffer.ccm.decrypt(o,e.ct,e.iv,e.tag,r,e.ts):sjcl.mode[e.mode].decrypt(o,e.ct,e.iv,r,e.ts),c.g(i,e),i.key=t,1===s.raw?r:sjcl.codec.utf8String.fromBits(r)},decrypt(t,e,s,i){let c=sjcl.json;return c.ia(t,c.decode(e),s,i)},encode(t){let e,s=\"{\",i=\"\";for(e in t)if(t.hasOwnProperty(e)){if(!e.match(/^[a-z0-9]+$/i))throw new sjcl.exception.invalid(\"json encode: invalid property name\");switch(s+=`${i}\"${e}\":`,i=\",\",typeof t[e]){case\"number\":case\"boolean\":s+=t[e];break;case\"string\":s+='\"'+encodeURI(t[e])+'\"';break;case\"object\":s+='\"'+sjcl.codec.base64.fromBits(t[e],0)+'\"';break;default:throw new sjcl.exception.bug(\"json encode: unsupported type\")}}return s+\"}\"},decode(t){if(!(t=t.replace(/\\s/g,\"\")).match(/^\\{.*\\}$/))throw new sjcl.exception.invalid(\"json decode: this isn't json!\");t=t.replace(/^\\{|\\}$/g,\"\").split(/,/);let e={},s,i;for(s=0;s<t.length;s++){if(!(i=t[s].match(/^\\s*(?:([\"']?)([a-z][a-z0-9]*)\\1)\\s*:\\s*(?:(-?\\d+)|\"([a-z0-9+\\/%*_.@=\\-]*)\"|(true|false))$/i)))throw new sjcl.exception.invalid(\"json decode: this isn't json!\");null!=i[3]?e[i[2]]=parseInt(i[3],10):null!=i[4]?e[i[2]]=i[2].match(/^(ct|adata|salt|iv)$/)?sjcl.codec.base64.toBits(i[4]):unescape(i[4]):null!=i[5]&&(e[i[2]]=\"true\"===i[5])}return e},g(t,e,s){if(void 0===t&&(t={}),void 0===e)return t;for(let i in e)if(e.hasOwnProperty(i)){if(s&&void 0!==t[i]&&t[i]!==e[i])throw new sjcl.exception.invalid(\"required parameter overridden\");t[i]=e[i]}return t},sa(t,e){let s={},i;for(i in t)t.hasOwnProperty(i)&&t[i]!==e[i]&&(s[i]=t[i]);return s},ra(t,e){let s={},i;for(i=0;i<e.length;i++)void 0!==t[e[i]]&&(s[e[i]]=t[e[i]]);return s}},sjcl.encrypt=sjcl.json.encrypt,sjcl.decrypt=sjcl.json.decrypt,sjcl.misc.pa={},sjcl.misc.cachedPbkdf2=function(t,e){let s=sjcl.misc.pa,i;return i=(e=e||{}).iter||1e3,(i=(s=s[t]=s[t]||{})[i]=s[i]||{firstSalt:e.salt&&e.salt.length?e.salt.slice(0):sjcl.random.randomWords(2,0)})[s=void 0===e.salt?i.firstSalt:e.salt]=i[s]||sjcl.misc.pbkdf2(t,s,e.iter),{key:i[s].slice(0),salt:s.slice(0)}};\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIjAiXSwibmFtZXMiOlsic2pjbCIsImNpcGhlciIsImhhc2giLCJrZXlleGNoYW5nZSIsIm1vZGUiLCJtaXNjIiwiY29kZWMiLCJleGNlcHRpb24iLCJbb2JqZWN0IE9iamVjdF0iLCJhIiwidGhpcyIsInRvU3RyaW5nIiwibWVzc2FnZSIsInQiLCJiIiwiYyIsImxlbmd0aCIsImludmFsaWQiLCJkIiwiZSIsImYiLCJnIiwiaCIsImsiLCJsIiwibiIsIm0iLCJwIiwiciIsInMiLCJxIiwidiIsInciLCJ4IiwidSIsIkYiLCJBIiwicmFuZG9tIiwiSyIsImhhc093blByb3BlcnR5IiwicHVzaCIsIkMiLCJ3aW5kb3ciLCJwZXJmb3JtYW5jZSIsIm5vdyIsImFkZEVudHJvcHkiLCJEYXRlIiwidmFsdWVPZiIsInkiLCJ6IiwiY29uY2F0IiwiTCIsImFlcyIsImVuY3J5cHQiLCJCIiwiYXBwbHkiLCJhcmd1bWVudHMiLCJPIiwic2xpY2UiLCJwcm90b3R5cGUiLCJiaXRBcnJheSIsIiQiLCJjbGFtcCIsIk1hdGgiLCJmbG9vciIsImdldFBhcnRpYWwiLCJjZWlsIiwicGFydGlhbCIsInJvdW5kIiwiYml0TGVuZ3RoIiwicG9wIiwidXRmOFN0cmluZyIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsImRlY29kZVVSSUNvbXBvbmVudCIsImVuY29kZVVSSSIsInVuZXNjYXBlIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiY2hhckNvZGVBdCIsImhleCIsInN1YnN0ciIsInJlcGxhY2UiLCJwYXJzZUludCIsImJhc2UzMiIsIlgiLCJCSVRTIiwiQkFTRSIsIlJFTUFJTklORyIsImNoYXJBdCIsInRvVXBwZXJDYXNlIiwiaW5kZXhPZiIsImJhc2UzMmhleCIsInRvQml0cyIsImZyb21CaXRzIiwiYmFzZTY0IiwiYmFzZTY0dXJsIiwiYnl0ZXMiLCJzaGEyNTYiLCJyZXNldCIsInVwZGF0ZSIsImZpbmFsaXplIiwiYmxvY2tTaXplIiwiWSIsIlVpbnQzMkFycmF5Iiwic3ViYXJyYXkiLCJzcGxpY2UiLCJwb3ciLCJzaGE1MTIiLCJpIiwiVCIsIlYiLCJEIiwiRSIsImdhIiwiUiIsImhhIiwiUyIsIkkiLCJKIiwiRyIsIlUiLCJNIiwiTiIsIloiLCJpYSIsIm1hIiwibmEiLCJqYSIsImNjbSIsIm5hbWUiLCJkYXRhIiwidGFnIiwiYml0U2xpY2UiLCJlcXVhbCIsImNvcnJ1cHQiLCJidWciLCJmYSIsIm9jYjIiLCJwbWFjIiwiZGVjcnlwdCIsImdjbSIsImthIiwiaiIsImhtYWMiLCJXIiwibWFjIiwiYWEiLCJkaWdlc3QiLCJwYmtkZjIiLCJwcm5nIiwiUCIsIkgiLCJvIiwicHJvZ3Jlc3MiLCJzZWVkZWQiLCJjYSIsImRhIiwiYmEiLCJpc1JlYWR5Iiwibm90UmVhZHkiLCJPYmplY3QiLCJjYWxsIiwibWF4IiwiZ2V0UHJvZ3Jlc3MiLCJsb2FkVGltZUNvbGxlY3RvciIsIm1vdXNlQ29sbGVjdG9yIiwib2EiLCJrZXlib2FyZENvbGxlY3RvciIsImxhIiwiYWNjZWxlcm9tZXRlckNvbGxlY3RvciIsImVhIiwidG91Y2hDb2xsZWN0b3IiLCJxYSIsImFkZEV2ZW50TGlzdGVuZXIiLCJkb2N1bWVudCIsImF0dGFjaEV2ZW50IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImRldGFjaEV2ZW50IiwiY2xpZW50WCIsIm9mZnNldFgiLCJjbGllbnRZIiwib2Zmc2V0WSIsInRvdWNoZXMiLCJjaGFuZ2VkVG91Y2hlcyIsInBhZ2VYIiwicGFnZVkiLCJhY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5Iiwib3JpZW50YXRpb24iLCJtb2R1bGUiLCJleHBvcnRzIiwicmVxdWlyZSIsInJhbmRvbUJ5dGVzIiwiVWludDhBcnJheSIsImJ1ZmZlciIsImNyeXB0byIsImdldFJhbmRvbVZhbHVlcyIsIm1zQ3J5cHRvIiwiY29uc29sZSIsImxvZyIsImpzb24iLCJkZWZhdWx0cyIsIml0ZXIiLCJrcyIsInRzIiwiYWRhdGEiLCJpdiIsInJhbmRvbVdvcmRzIiwic2FsdCIsImNhY2hlZFBia2RmMiIsImtleSIsImVjYyIsImVsR2FtYWwiLCJwdWJsaWNLZXkiLCJrZW0iLCJrZW10YWciLCJjdCIsImFycmF5QnVmZmVyIiwiQXJyYXlCdWZmZXIiLCJlbmNvZGUiLCJzZWNyZXRLZXkiLCJ1bmtlbSIsInJhdyIsImRlY29kZSIsIm1hdGNoIiwic3BsaXQiLCJwYSIsImZpcnN0U2FsdCJdLCJtYXBwaW5ncyI6IkFBNkRBLGFBQ0EsSUFBSUEsTUFDQUMsVUFDQUMsUUFDQUMsZUFDQUMsUUFDQUMsUUFDQUMsU0FDQUMsV0FDSUMsUUFBa0JDLEdBQ2RDLEtBQUtDLFNBQVcsV0FDWixrQkFBbUJELEtBQUtFLFdBRTVCRixLQUFLRSxRQUFVSCxHQUVuQkQsUUFBa0JDLEdBQ2RDLEtBQUtDLFNBQVcsV0FDWixrQkFBbUJELEtBQUtFLFdBRTVCRixLQUFLRSxRQUFVSCxHQUVuQkQsSUFBY0MsR0FDVkMsS0FBS0MsU0FBVyxXQUNaLGNBQWVELEtBQUtFLFdBRXhCRixLQUFLRSxRQUFVSCxHQUVuQkQsU0FBbUJDLEdBQ2ZDLEtBQUtDLFNBQVcsV0FDWixvQkFBcUJELEtBQUtFLFdBRTlCRixLQUFLRSxRQUFVSCxLQXVFM0IsU0FBU0ksRUFBRUosRUFBR0ssRUFBR0MsR0FDYixHQUFJLElBQU1ELEVBQUVFLE9BQVEsTUFBTSxJQUFJaEIsS0FBS08sVUFBVVUsUUFDekMsMEJBQ0osSUFBSUMsRUFBSVQsRUFBRUssRUFBRUMsR0FDUkksRUFBSUwsRUFBRSxHQUFLSSxFQUFFLEdBQ2JFLEVBQUlOLEVBQUVDLEVBQUksRUFBSSxHQUFLRyxFQUFFLEdBQ3JCRyxFQUFJUCxFQUFFLEdBQUtJLEVBQUUsR0FDakJKLEVBQUlBLEVBQUVDLEVBQUksRUFBSSxHQUFLRyxFQUFFLEdBQ3JCLElBQUlJLEVBQUdDLEVBQUdDLEVBQUdDLEVBQUlQLEVBQUVGLE9BQVMsRUFBSSxFQUM1QlUsRUFBR0MsRUFBSSxFQUNQQyxHQUFLLEVBQUcsRUFBRyxFQUFHLEdBRWxCbkIsR0FEQWEsRUFBSWIsRUFBRW9CLEVBQUVkLElBQ0YsR0FDTixJ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"},
            'smalltalk.js': {"requiresElectron":false,"requiresBrowser":true,"code":"\"use strict\";$(\"head\").append(\"<style>.smalltalk{display:flex;align-items:center;flex-direction:column;justify-content:center;transition:200ms opacity;bottom:0;left:0;overflow:auto;padding:20px;position:fixed;right:0;top:0;z-index:100}.smalltalk + .smalltalk{transition:ease 1s;display:none}.smalltalk .page{border-radius:3px;background:white;box-shadow:0 4px 23px 5px rgba(0, 0, 0, .2), 0 2px 6px rgba(0, 0, 0, .15);color:#333;min-width:400px;padding:0;position:relative;z-index:0}@media only screen and (max-width: 500px){.smalltalk .page{min-width:0}}.smalltalk .page > .close-button{background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAQAAAC1QeVaAAAAUklEQVR4XqXPYQrAIAhAYW/gXd8NJxTopVqsGEhtf+L9/ERU2k/HSMFQpKcYJeNFI9Be0LCMij8cYyjj5EHIivGBkwLfrbX3IF8PqumVmnDpEG+eDsKibPG2JwAAAABJRU5ErkJggg==') no-repeat center;height:14px;position:absolute;right:7px;top:7px;width:14px;z-index:1}.smalltalk .page > .close-button:hover{background-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAQAAAC1QeVaAAAAnUlEQVR4XoWQQQ6CQAxFewjkJkMCyXgJPMk7AiYczyBeZEAX6AKctGIaN+bt+trk9wtGQc/IkhnoKGxqqiWxOSZalapWFZ6VrIUDExsN0a5JRBq9LoVOR0eEQMoEhKizXhhsn0p1sCWVo7CwOf1RytPL8CPvwuBUoHL6ugeK30CVD1TqK7V/hdpe+VNChhOzV8xWny/+xosHF8578W/Hmc1OOC3wmwAAAABJRU5ErkJggg==')}.smalltalk .page header{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:500px;user-select:none;color:#333;font-size:120%;font-weight:bold;margin:0;padding:14px 17px;text-shadow:white 0 1px 2px}.smalltalk .page .content-area{overflow:hidden;text-overflow:ellipsis;padding:6px 17px;position:relative}.smalltalk .page .action-area{padding:14px 17px}button{font-family:Ubuntu, Arial, sans-serif}.smalltalk .smalltalk,.smalltalk button{min-height:2em;min-width:4em}.smalltalk button{appearance:none;user-select:none;background-image:linear-gradient(#ededed, #ededed 38%, #dedede);border:1px solid rgba(0, 0, 0, 0.25);border-radius:2px;box-shadow:0 1px 0 rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.75);color:#444;font:inherit;margin:0 1px 0 0;text-shadow:0 1px 0 rgb(240, 240, 240)}.smalltalk button::-moz-focus-inner{border:0}.smalltalk button:enabled:active{background-image:linear-gradient(#e7e7e7, #e7e7e7 38%, #d7d7d7);box-shadow:none;text-shadow:none}.smalltalk .page .button-strip{display:flex;flex-direction:row;justify-content:flex-end}.smalltalk .page .button-strip > button{margin-left:10px}.smalltalk input{width:100%;border:1px solid #bfbfbf;border-radius:2px;box-sizing:border-box;color:#444;font:inherit;margin:0;min-height:2em;padding:3px;outline:none}.smalltalk button:enabled:focus,.smalltalk input:enabled:focus{transition:border-color 200ms;border-color:rgb(77, 144, 254);outline:none}\");const BUTTON_OK=[\"OK\"],BUTTON_OK_CANCEL=[\"OK\",\"Cancel\"],__smalltalk_remove=__smalltalk_bind(__smalltalk_removeEl,\".smalltalk\"),__smalltalk_store=t=>{const a={value:t};return function(t){return arguments.length?(a.value=t,t):a.value}};function _alert(t,a){return __smalltalk_showDialog(t,a,\"\",BUTTON_OK,{cancel:!1})}function _prompt(t,a,e=\"\",l){const n=__smalltalk_getType(l),o=String(e).replace(/\"/g,\"&quot;\"),s=`<input type=\"${n}\" value=\"${o}\" data-name=\"js-input\">`;return __smalltalk_showDialog(t,a,s,BUTTON_OK_CANCEL,l)}function _confirm(t,a,e){return __smalltalk_showDialog(t,a,\"\",BUTTON_OK_CANCEL,e)}function __smalltalk_getType(t={}){const{type:a}=t;return\"password\"===a?\"password\":\"text\"}function __smalltalk_getTemplate(t,a,e,l){const n=a.replace(/\\n/g,\"<br>\");return`<div class=\"page\"><div data-name=\"js-close\" class=\"close-button\"></div><header>${t}</header><div class=\"content-area\">${n}${e}</div><div class=\"action-area\"><div class=\"button-strip\"> ${l.map((t,a)=>`<button tabindex=${a} data-name=\"js-${t.toLowerCase()}\">${t}</button>`).join(\"\")}</div></div></div>`}function __smalltalk_showDialog(t,a,e,l,n){const o=__smalltalk_store(),s=__smalltalk_store(),i=document.createElement(\"div\"),r=[\"cancel\",\"close\",\"ok\"],_=new Promise((t,a)=>{const e=n&&!n.cancel,l=()=>{};o(t),s(e?l:a)});return i.innerHTML=__smalltalk_getTemplate(t,a,e,l),i.className=\"smalltalk\",document.body.appendChild(i),__smalltalk_find(i,[\"ok\",\"input\"]).forEach(t=>t.focus()),__smalltalk_find(i,[\"input\"]).forEach(t=>{t.setSelectionRange(0,e.length)}),__smalltalk_addListenerAll(\"click\",i,r,t=>__smalltalk_closeDialog(t.target,i,o(),s())),[\"click\",\"contextmenu\"].forEach(t=>i.addEventListener(t,()=>__smalltalk_find(i,[\"ok\",\"input\"]).forEach(t=>t.focus()))),i.addEventListener(\"keydown\",currify(__smalltalk_keyDownEvent)(i,o(),s())),_}function __smalltalk_keyDownEvent(t,a,e,l){const n={ENTER:13,ESC:27,TAB:9,LEFT:37,UP:38,RIGHT:39,DOWN:40},o=l.keyCode,s=l.target,i=[\"ok\",\"cancel\",\"input\"],r=__smalltalk_find(t,i).map(__smalltalk_getDataName);switch(o){case n.ENTER:__smalltalk_closeDialog(s,t,a,e),l.preventDefault();break;case n.ESC:__smalltalk_remove(),e();break;case n.TAB:l.shiftKey&&__smalltalk_tab(t,r),__smalltalk_tab(t,r),l.preventDefault();break;default:[\"left\",\"right\",\"up\",\"down\"].filter(t=>o===n[t.toUpperCase()]).forEach(()=>{__smalltalk_changeButtonFocus(t,r)})}l.stopPropagation()}function __smalltalk_getDataName(t){return t.getAttribute(\"data-name\").replace(\"js-\",\"\")}function __smalltalk_changeButtonFocus(t,a){const e=document.activeElement,l=__smalltalk_getDataName(e),n=/ok|cancel/.test(l),o=a.length-1,s=t=>\"cancel\"===t?\"ok\":\"cancel\";if(\"input\"===l||!o||!n)return;const i=s(l);__smalltalk_find(t,[i]).forEach(t=>{t.focus()})}const __smalltalk_getIndex=(t,a)=>a===t?0:a+1;function __smalltalk_tab(t,a){const e=document.activeElement,l=__smalltalk_getDataName(e),n=a.length-1,o=a.indexOf(l),s=__smalltalk_getIndex(n,o),i=a[s];__smalltalk_find(t,[i]).forEach(t=>t.focus())}function __smalltalk_closeDialog(t,a,e,l){const n=t.getAttribute(\"data-name\").replace(\"js-\",\"\");if(/close|cancel/.test(n))return l(),void __smalltalk_remove();const o=__smalltalk_find(a,[\"input\"]).reduce((t,a)=>a.value,null);e(o),__smalltalk_remove()}function __smalltalk_find(t,a){return a.map(a=>t.querySelector(`[data-name=\"js-${a}\"]`)).filter(t=>t)}function __smalltalk_addListenerAll(t,a,e,l){__smalltalk_find(a,e).forEach(a=>a.addEventListener(t,l))}function __smalltalk_removeEl(t){const a=document.querySelector(t);a.parentElement.removeChild(a)}function __smalltalk_bind(t,...a){return()=>t(...a)}\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIjAiXSwibmFtZXMiOlsiJCIsImFwcGVuZCIsIkJVVFRPTl9PSyIsIkJVVFRPTl9PS19DQU5DRUwiLCJfX3NtYWxsdGFsa19yZW1vdmUiLCJfX3NtYWxsdGFsa19iaW5kIiwiX19zbWFsbHRhbGtfcmVtb3ZlRWwiLCJfX3NtYWxsdGFsa19zdG9yZSIsInZhbHVlIiwiZGF0YSIsImFyZ3VtZW50cyIsImxlbmd0aCIsIl9hbGVydCIsInRpdGxlIiwibXNnIiwiX19zbWFsbHRhbGtfc2hvd0RpYWxvZyIsImNhbmNlbCIsIl9wcm9tcHQiLCJvcHRpb25zIiwidHlwZSIsIl9fc21hbGx0YWxrX2dldFR5cGUiLCJ2YWwiLCJTdHJpbmciLCJyZXBsYWNlIiwidmFsdWVTdHIiLCJfY29uZmlybSIsIl9fc21hbGx0YWxrX2dldFRlbXBsYXRlIiwiYnV0dG9ucyIsImVuY29kZWRNc2ciLCJtYXAiLCJuYW1lIiwiaSIsInRvTG93ZXJDYXNlIiwiam9pbiIsIm9rIiwiZGlhbG9nIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiY2xvc2VCdXR0b25zIiwicHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Iiwibm9DYW5jZWwiLCJlbXB0eSIsImlubmVySFRNTCIsImNsYXNzTmFtZSIsImJvZHkiLCJhcHBlbmRDaGlsZCIsIl9fc21hbGx0YWxrX2ZpbmQiLCJmb3JFYWNoIiwiZWwiLCJmb2N1cyIsInNldFNlbGVjdGlvblJhbmdlIiwiX19zbWFsbHRhbGtfYWRkTGlzdGVuZXJBbGwiLCJldmVudCIsIl9fc21hbGx0YWxrX2Nsb3NlRGlhbG9nIiwidGFyZ2V0IiwiYWRkRXZlbnRMaXN0ZW5lciIsImN1cnJpZnkiLCJfX3NtYWxsdGFsa19rZXlEb3duRXZlbnQiLCJLRVkiLCJFTlRFUiIsIkVTQyIsIlRBQiIsIkxFRlQiLCJVUCIsIlJJR0hUIiwiRE9XTiIsImtleUNvZGUiLCJuYW1lc0FsbCIsIm5hbWVzIiwiX19zbWFsbHRhbGtfZ2V0RGF0YU5hbWUiLCJwcmV2ZW50RGVmYXVsdCIsInNoaWZ0S2V5IiwiX19zbWFsbHRhbGtfdGFiIiwiZmlsdGVyIiwidG9VcHBlckNhc2UiLCJfX3NtYWxsdGFsa19jaGFuZ2VCdXR0b25Gb2N1cyIsInN0b3BQcm9wYWdhdGlvbiIsImdldEF0dHJpYnV0ZSIsImFjdGl2ZSIsImFjdGl2ZUVsZW1lbnQiLCJhY3RpdmVOYW1lIiwiaXNCdXR0b24iLCJ0ZXN0IiwiY291bnQiLCJnZXROYW1lIiwiX19zbWFsbHRhbGtfZ2V0SW5kZXgiLCJpbmRleCIsImFjdGl2ZUluZGV4IiwiaW5kZXhPZiIsInJlZHVjZSIsImVsZW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiYSIsInBhcmVudCIsImVsZW1lbnRzIiwiZm4iLCJwYXJlbnRFbGVtZW50IiwicmVtb3ZlQ2hpbGQiLCJhcmdzIl0sIm1hcHBpbmdzIjoiQUF3QkEsYUFFQUEsRUFBRSxRQUFRQyxPQUFPLDZuRkFFakIsTUFBTUMsV0FBYSxNQUNiQyxrQkFBb0IsS0FBTSxVQUUxQkMsbUJBQXFCQyxpQkFBa0JDLHFCQUFzQixjQUc3REMsa0JBQXNCQyxJQUN4QixNQUFNQyxHQUNGRCxNQUFBQSxHQUdKLE9BQU8sU0FBV0EsR0FDZCxPQUFNRSxVQUFVQyxRQUdoQkYsRUFBS0QsTUFBUUEsRUFFTkEsR0FKSUMsRUFBS0QsUUFReEIsU0FBU0ksT0FBUUMsRUFBT0MsR0FDcEIsT0FBT0MsdUJBQXdCRixFQUFPQyxFQUFLLEdBQUlaLFdBQWFjLFFBQVEsSUFHeEUsU0FBU0MsUUFBU0osRUFBT0MsRUFBS04sRUFBUSxHQUFJVSxHQUN0QyxNQUFNQyxFQUFPQyxvQkFBcUJGLEdBRTVCRyxFQUFNQyxPQUFRZCxHQUNmZSxRQUFTLEtBQU0sVUFFZEMsa0JBQTRCTCxhQUFrQkUsMkJBRXBELE9BQU9OLHVCQUF3QkYsRUFBT0MsRUFBS1UsRUFBVXJCLGlCQUFrQmUsR0FHM0UsU0FBU08sU0FBVVosRUFBT0MsRUFBS0ksR0FDM0IsT0FBT0gsdUJBQXdCRixFQUFPQyxFQUFLLEdBQUlYLGlCQUFrQmUsR0FH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"}
        };
    }

    /* ============================================================== */

    /* ===================== STANDARD CALLBACKS ===================== */

    /**
     * @public
     * @desc Starts the script execution. This is called by BetterDiscord if the plugin is enabled.
     */
    start() {
        /* Backup class instance. */
        const self = this;

        /* Perform idiot-proof check to make sure the user named the plugin `discordCrypt.plugin.js` */
        if ( !discordCrypt.validPluginName() ) {
            _alert(
                'Hi There! - DiscordCrypt',
                "Oops!\r\n\r\n" +
                "It seems you didn't read discordCrypt's usage guide. :(\r\n" +
                "You need to name this plugin exactly as follows to allow it to function correctly.\r\n\r\n" +
                `\t${discordCrypt.getPluginName()}\r\n\r\n\r\n` +
                "You should probably check the usage guide again just in case you missed anything else. :)"
            );
            return;
        }

        /* Perform startup and load the config file if not already loaded. */
        if ( !this.configFile ) {
            /* Load the master password. */
            this.loadMasterPassword();

            /* Don't do anything further till we have a configuration file. */
            return;
        }

        /* Don't check for updates if running a debug version. */
        if ( !discordCrypt.__shouldIgnoreUpdates( this.getVersion() ) ) {
            /* Check for any new updates. */
            this.checkForUpdates();

            /* Add an update handler to check for updates every 60 minutes. */
            this.updateHandlerInterval = setInterval( () => {
                self.checkForUpdates();
            }, 3600000 );
        }

        /* Get module searcher for caching. */
        const WebpackModules = discordCrypt.getWebpackModuleSearcher();

        /* Resolve and cache all modules needed. */
        this.cachedModules = {
            MessageParser: WebpackModules
                .findByUniqueProperties( [ 'createMessage', 'parse', 'unparse' ] ),
            MessageController: WebpackModules
                .findByUniqueProperties( [ "sendClydeError", "sendBotMessage" ] ),
            MessageActionTypes: WebpackModules
                .findByUniqueProperties( [ "ActionTypes", "ActivityTypes" ] ),
            MessageDispatcher: WebpackModules
                .findByUniqueProperties( [ "dispatch", "maybeDispatch", "dirtyDispatch" ] ),
            MessageQueue: WebpackModules
                .findByUniqueProperties( [ "enqueue", "handleSend", "handleResponse" ] ),
            UserResolver: WebpackModules
                .findByUniqueProperties( [ "getUser", "getUsers", "findByTag" ] ),
            GuildResolver: WebpackModules
                .findByUniqueProperties( [ "getGuild", "getGuilds" ] ),
            ChannelResolver: WebpackModules
                .findByUniqueProperties( [ "getChannel", "getChannels", "getDMFromUserId", 'getDMUserIds' ] ),
            HighlightJS: WebpackModules
                .findByUniqueProperties( [ 'initHighlighting', 'highlightBlock', 'highlightAuto' ] ),
        };

        /* Throw an error if a cached module can't be found. */
        for ( let prop in this.cachedModules ) {
            if ( typeof this.cachedModules[ prop ] !== 'object' ) {
                _alert( 'Error Loading DiscordCrypt', `Could not find requisite module: ${prop}` );
                return;
            }
        }

        /* Hook switch events as the main event processor. */
        if ( !this.hookMessageCallbacks() ) {
            /* The toolbar fails to properly load on switches to the friends list. Create an interval to do this. */
            this.toolbarReloadInterval = setInterval( () => {
                self.loadToolbar();
                self.attachHandler();
            }, 5000 );
        }
        else {
            setImmediate( () => {
                /* Add the toolbar. */
                this.loadToolbar();

                /* Attach the message handler. */
                this.attachHandler();
            } );
        }

        /* Process any blocks on an interval since Discord loves to throttle messages. */
        this.scanInterval = setInterval( () => {
            self.decodeMessages();
        }, self.configFile.encryptScanDelay );

        /* Setup the timed message handler to trigger every 5 seconds. */
        this.timedMessageInterval = setInterval( () => {
            /* Get the current time. */
            let n = Date.now();

            /* Loop over each message. */
            self.configFile.timedMessages.forEach( ( e, i ) => {
                /* Skip invalid elements. */
                if ( !e || !e.expireTime ) {
                    /* Delete the index. */
                    self.configFile.timedMessages.splice( i, 1 );

                    /* Update the configuration to the disk. */
                    self.saveConfig();
                }

                /* Only continue if the message has been expired. */
                if ( e.expireTime < n ) {
                    /* Quickly log. */
                    discordCrypt.log( `Deleting timed message "${self.configFile.timedMessages[ i ].messageId}"` );

                    try {
                        /* Delete the message. This will be queued if a rate limit is in effect. */
                        discordCrypt.deleteMessage( e.channelId, e.messageId, self.cachedModules );
                    }
                    catch ( e ) {
                        /* Log the error that occurred. */
                        discordCrypt.log( `${e.messageId}: ${e.toString()}`, 'error' );
                    }

                    /* Delete the index. */
                    self.configFile.timedMessages.splice( i, 1 );

                    /* Update the configuration to the disk. */
                    self.saveConfig();
                }
            } );

        }, 5000 );

        setImmediate( () => {
            /* Decode all messages immediately. */
            self.decodeMessages();
        } );
    }

    /**
     * @public
     * @desc Stops the script execution. This is called by BetterDiscord if the plugin is disabled or during shutdown.
     */
    stop() {
        /* Nothing needs to be done since start() wouldn't have triggered. */
        if ( !discordCrypt.validPluginName() )
            return;

        /* Remove onMessage event handler hook. */
        $( this.channelTextAreaClass ).off( "keydown.dcrypt" );

        /* Unhook switch events if available or fallback to clearing timed handlers. */
        if ( !this.unhookMessageCallbacks() ) {
            /* Unload the toolbar reload interval. */
            clearInterval( this.toolbarReloadInterval );
        }

        /* Unload the decryption interval. */
        clearInterval( this.scanInterval );

        /* Unload the timed message handler. */
        clearInterval( this.timedMessageInterval );

        /* Unload the update handler. */
        clearInterval( this.updateHandlerInterval );

        /* Unload elements. */
        $( "#dc-overlay" ).remove();
        $( '#dc-file-btn' ).remove();
        $( '#dc-lock-btn' ).remove();
        $( '#dc-passwd-btn' ).remove();
        $( '#dc-exchange-btn' ).remove();
        $( '#dc-settings-btn' ).remove();
        $( '#dc-quick-exchange-btn' ).remove();
        $( '#dc-clipboard-upload-btn' ).remove();

        /* Clear the configuration file. */
        this.configFile = null;
    }

    /**
     * @public
     * @desc Triggered when the script has to load resources. This is called once upon Discord startup.
     */
    load() {
        /* Inject application CSS. */
        discordCrypt.injectCSS( 'dc-css', this.appCss );

        /* Load necessary libraries. */
        discordCrypt.loadLibraries( this.libraries );
    }

    /**
     * @public
     * @desc Triggered when the script needs to unload its resources. This is called during Discord shutdown.
     */
    unload() {
        /* Clear the injected CSS. */
        discordCrypt.clearCSS( 'dc-css' );
    }

    /* =================== END STANDARD CALLBACKS =================== */

    /* =================== CONFIGURATION DATA CBS =================== */

    /**
     * @private
     * @desc Returns the default settings for the plugin.
     * @returns {Config}
     */
    getDefaultConfig() {
        return {
            /* Current Version. */
            version: this.getVersion(),
            /* Whether to send messages using embedded objects. */
            useEmbeds: false,
            /* Default password for servers not set. */
            defaultPassword: "⠓⣭⡫⣮⢹⢮⠖⣦⠬⢬⣸⠳⠜⣍⢫⠳⣂⠙⣵⡘⡕⠐⢫⢗⠙⡱⠁⡷⠺⡗⠟⠡⢴⢖⢃⡙⢺⣄⣑⣗⢬⡱⣴⠮⡃⢏⢚⢣⣾⢎⢩⣙⠁⣶⢁⠷⣎⠇⠦⢃⠦⠇⣩⡅",
            /* Defines what needs to be typed at the end of a message to encrypt it. */
            encodeMessageTrigger: "ENC",
            /* How often to scan for encrypted messages. */
            encryptScanDelay: 1000,
            /* Default encryption mode. */
            encryptMode: 7, /* AES(Camellia) */
            /* Default block operation mode for ciphers. */
            encryptBlockMode: 'CBC',
            /* Encode all messages automatically when a password has been set. */
            encodeAll: true,
            /* Default padding mode for blocks. */
            paddingMode: 'PKC7',
            /* Password array of objects for users or channels. */
            passList: {},
            /* Contains the URL of the Up1 client. */
            up1Host: 'https://share.riseup.net',
            /* Contains the API key used for transactions with the Up1 host. */
            up1ApiKey: '59Mnk5nY6eCn4bi9GvfOXhMH54E7Bh6EMJXtyJfs',
            /* Internal message list for time expiration. */
            timedMessages: [],
            /* How long after a message is sent to remove it. */
            timedMessageExpires: 0
        };
    }

    /**
     * @private
     * @desc Checks if the configuration file exists.
     * @returns {boolean} Returns true if the configuration file exists.
     */
    configExists() {
        /* Attempt to parse the configuration file. */
        let data = bdPluginStorage.get( this.getName(), 'config' );

        /* The returned data must be defined and non-empty. */
        return data && data !== null && data !== '';
    }

    /**
     * @private
     * @desc Loads the configuration file from `discordCrypt.config.json` and adds or removes any properties required.
     * @returns {boolean}
     */
    loadConfig() {
        discordCrypt.log( 'Loading configuration file ...' );

        /* Attempt to parse the configuration file. */
        let data = bdPluginStorage.get( this.getName(), 'config' );

        /* Check if the config file exists. */
        if ( !data || data === null || data === '' ) {
            /* File doesn't exist, create a new one. */
            this.configFile = this.getDefaultConfig();

            /* Save the config. */
            this.saveConfig();

            /* Nothing further to do. */
            return true;
        }

        try {
            /* Try parsing the decrypted data. */
            this.configFile = JSON.parse(
                discordCrypt.aes256_decrypt_gcm( data.data, this.masterPassword, 'PKC7', 'utf8', false )
            );
        }
        catch ( err ) {
            discordCrypt.log( `Decryption of configuration file failed - ${err}`, 'error' );
            return false;
        }

        /* If it fails, return an error. */
        if ( !this.configFile || !this.configFile.version ) {
            discordCrypt.log( 'Decryption of configuration file failed.', 'error' );
            return false;
        }

        /* Try checking for each property within the config file and make sure it exists. */
        let defaultConfig = this.getDefaultConfig(), needs_save = false;

        /* Iterate all defined properties in the default configuration file. */
        for ( let prop in defaultConfig ) {
            /* If the defined property doesn't exist in the current configuration file ... */
            if ( !this.configFile.hasOwnProperty( prop ) ) {
                /* Use the default. */
                this.configFile[ prop ] = defaultConfig[ prop ];

                /* Show a simple log. */
                discordCrypt.log( `Default value added for missing property '${prop}' in the configuration file.` );

                /* Set the flag for saving. */
                needs_save = true;
            }
        }

        /* Iterate all defined properties in the current configuration file and remove any undefined ones. */
        for ( let prop in this.configFile ) {
            /* If the default configuration doesn't contain this property, delete it as it's unnecessary. */
            if ( !defaultConfig.hasOwnProperty( prop ) ) {
                /* Delete the property. */
                delete this.configFile[ prop ];

                /* Show a simple log. */
                discordCrypt.log( `Removing unknown property '${prop}' from the configuration file.` );

                /* Set the flag for saving. */
                needs_save = true;
            }
        }

        /* Check for version mismatch. */
        if ( this.configFile.version !== this.getVersion() ) {
            /* Preserve the old version for logging. */
            let oldVersion = this.configFile.version;

            /* Preserve the old password list before updating. */
            let oldCache = this.configFile.passList;

            /* Get the most recent default configuration. */
            this.configFile = this.getDefaultConfig();

            /* Now restore the password list. */
            this.configFile.passList = oldCache;

            /* Set the flag for saving. */
            needs_save = true;

            /* Alert. */
            discordCrypt.log( `Updated plugin version from v${oldVersion} to v${this.getVersion()}.` );
        }

        /* Save the configuration file if necessary. */
        if ( needs_save )
            this.saveConfig();

        discordCrypt.log( `Loaded configuration file! - v${this.configFile.version}` );

        return true;
    }

    /**
     * @private
     * @desc Saves the configuration file with the current password using AES-256 in GCM mode.
     */
    saveConfig() {
        /* Encrypt the message using the master password and save the encrypted data. */
        bdPluginStorage.set( this.getName(), 'config', {
            data:
                discordCrypt.aes256_encrypt_gcm(
                    JSON.stringify( this.configFile ),
                    this.masterPassword,
                    'PKC7',
                    false
                )
        } );
    }

    /**
     * @private
     * @desc Updates and saves the configuration data used and updates a given button's text.
     * @param {Object} btn The jQuery button to set the update text for.
     */
    saveSettings( btn ) {
        /* Save the configuration file. */
        this.saveConfig();

        /* Tell the user that their settings were applied. */
        btn.text( 'Saved & Applied!' );

        /* Reset the original text after a second. */
        setTimeout( ( function () {
            btn.text( 'Save & Apply' );
        } ), 1000 );

        /* Force decode messages. */
        this.decodeMessages( true );
    }

    /**
     * @private
     * @desc Resets the default configuration data used and updates a given button's text.
     * @param {Object} btn The jQuery button to set the update text for.
     */
    resetSettings( btn ) {
        /* Preserve the old password list before resetting. */
        let oldCache = this.configFile.passList;

        /* Retrieve the default configuration. */
        this.configFile = this.getDefaultConfig();

        /* Restore the old passwords. */
        this.configFile.passList = oldCache;

        /* Save the configuration file to update any settings. */
        this.saveConfig();

        /* Tell the user that their settings were reset. */
        btn.text( 'Restored Default Settings!' );

        /* Reset the original text after a second. */
        setTimeout( ( function () {
            btn.text( 'Reset Settings' );
        } ), 1000 );

        /* Force decode messages. */
        this.decodeMessages( true );
    }

    /**
     * @private
     * @desc Update the current password field and save the config file.
     */
    updatePasswords() {
        /* Don't save if the password overlay is not open. */
        if ( $( '#dc-overlay-password' ).css( 'display' ) !== 'block' )
            return;

        let prim = $( "#dc-password-primary" );
        let sec = $( "#dc-password-secondary" );

        /* Check if a primary password has actually been entered. */
        if ( !( prim.val() !== '' && prim.val().length > 1 ) )
            delete this.configFile.passList[ discordCrypt.getChannelId() ];
        else {
            /* Update the password field for this id. */
            this.configFile.passList[ discordCrypt.getChannelId() ] =
                discordCrypt.createPassword( prim.val(), '' );

            /* Only check for a secondary password if the primary password has been entered. */
            if ( sec.val() !== '' && sec.val().length > 1 )
                this.configFile.passList[ discordCrypt.getChannelId() ].secondary = sec.val();

            /* Update the password toolbar. */
            prim.val( '' );
            sec.val( '' );
        }

        /* Save the configuration file and decode any messages. */
        this.saveConfig();

        /* Decode any messages with the new password(s). */
        this.decodeMessages( true );
    }

    /* ================= END CONFIGURATION CBS ================= */

    /* =================== PROJECT UTILITIES =================== */

    /**
     * @public
     * @desc Removes the extension from a file name.
     * @param {string} file_name The name of the script file.
     * @return {string} Returns the sanitized file name.
     */
    static sanitizeScriptNameToVariable( file_name ) {
        return file_name.replace( '.js', '' )
    }

    /**
     * @public
     * @desc Loads all compiled libraries as needed.
     * @param {LibraryDefinition} libraries A list of all libraries to load.
     */
    static loadLibraries( libraries ) {
        const vm = require( 'vm' );

        /* Inject all compiled libraries based on if they're needed */
        for ( let name in libraries ) {
            let libInfo = libraries[ name ];

            /* Browser code requires a window object to be defined. */
            if ( libInfo.requiresBrowser && typeof window === 'undefined' ) {
                discordCrypt.log( `Skipping loading of browser-required plugin: ${name} ...`, 'warn' );
                continue;
            }

            /* If the module can't be loaded, don't load this library. */
            if ( libInfo.requiresElectron ) {
                try {
                    require( 'electron' );
                }
                catch ( e ) {
                    discordCrypt.log( `Skipping loading of electron-required plugin: ${name} ...`, 'warn' );
                    continue;
                }
            }

            /* Determine how to run this. */
            if ( libInfo.requiresBrowser || libInfo.requiresElectron ) {
                /* Run in the current context as it operates on currently defined objects. */
                vm.runInThisContext( libInfo.code, {
                    filename: name,
                    displayErrors: false
                } );
            }
            else {
                /* Run in a new sandbox and store the result in a global object. */
                global[ discordCrypt.sanitizeScriptNameToVariable( name ) ] =
                    vm.runInNewContext(
                        libInfo.code,
                        {
                            filename: name,
                            displayErrors: false
                        }
                    );
            }
        }
    }

    /**
     * @public
     * @desc Returns the name of the plugin file expected on the disk.
     * @returns {string}
     * @example
     * console.log( discordCrypt.getPluginName() );
     * // "discordCrypt.plugin.js"
     */
    static getPluginName() {
        return 'discordCrypt.plugin.js';
    }

    /**
     * @public
     * @desc Check if the plugin is named correctly by attempting to open the plugin file in the BetterDiscord
     *      plugin path.
     * @returns {boolean}
     * @example
     * console.log( discordCrypt.validPluginName() );
     * // False
     */
    static validPluginName() {
        return require( 'fs' )
            .existsSync( require( 'path' )
                .join( discordCrypt.getPluginsPath(), discordCrypt.getPluginName() ) );
    }

    /**
     * @public
     * @desc Returns the platform-specific path to BetterDiscord's plugin directory.
     * @returns {string} The expected path ( which may not exist ) to BetterDiscord's plugin directory.
     * @example
     * console.log( discordCrypt.getPluginsPath() );
     * // "C:\Users\John Doe\AppData\Local/BetterDiscord/plugins"
     */
    static getPluginsPath() {
        const process = require( 'process' );
        return `${process.platform === 'win32' ?
            process.env.APPDATA :
            process.platform === 'darwin' ?
                process.env.HOME + '/Library/Preferences' :
                process.env.HOME + '/.config'}/BetterDiscord/plugins/`;
    }

    /**
     * @public
     * @desc Checks the update server for an encrypted update.
     * @param {UpdateCallback} on_update_callback
     * @returns {boolean}
     * @example
     * checkForUpdate( ( file_data, short_hash, new_version, full_changelog ) =>
     *      console.log( `New Update Available: #${short_hash} - v${new_version}` );
     *      console.log( `Changelog:\n${full_changelog}` );
     * } );
     */
    static checkForUpdate( on_update_callback ) {
        /* Update URL and request method. */
        const update_url = `https://gitlab.com/leogx9r/DiscordCrypt/raw/master/build/${discordCrypt.getPluginName()}`;
        const changelog_url = 'https://gitlab.com/leogx9r/DiscordCrypt/raw/master/src/CHANGELOG';

        /* Make sure the callback is a function. */
        if ( typeof on_update_callback !== 'function' )
            return false;

        /* Perform the request. */
        try {
            /* Download the update. */
            discordCrypt.__getRequest( update_url, ( statusCode, errorString, data ) => {
                /* Make sure no error occurred. */
                if ( statusCode !== 200 ) {
                    /* Log the error accordingly. */
                    switch ( statusCode ) {
                        case 404:
                            discordCrypt.log( 'Update URL is broken.', 'error' );
                            break;
                        case 403:
                            discordCrypt.log( 'Forbidden request when checking for updates.', 'error' );
                            break;
                        default:
                            discordCrypt.log( `Error while fetching update: ${errorString}`, 'error' );
                            break;
                    }

                    return;
                }

                /* Format properly. */
                data = data.replace( '\r', '' );

                /* Get the local file. */
                let localFile = '//META{"name":"discordCrypt"}*//\n';
                try {
                    localFile = require( 'fs' ).readFileSync(
                        require( 'path' ).join(
                            discordCrypt.getPluginsPath(),
                            discordCrypt.getPluginName()
                        )
                    ).toString().replace( '\r', '' );
                }
                catch ( e ) {
                    discordCrypt.log( 'Plugin file could not be locally read. Assuming testing version ...', 'warn' );
                }

                /* Check the first line which contains the metadata to make sure that they're equal. */
                if ( data.split( '\n' )[ 0 ] !== localFile.split( '\n' )[ 0 ] ) {
                    discordCrypt.log( 'Plugin metadata is missing from either the local or update file.', 'error' );
                    return;
                }

                /* Read the current hash of the plugin and compare them.. */
                let currentHash = discordCrypt.sha256( localFile );
                let hash = discordCrypt.sha256( data );
                let shortHash = Buffer.from( hash, 'base64' )
                    .toString( 'hex' )
                    .slice( 0, 8 );

                /* If the hash equals the retrieved one, no update is needed. */
                if ( hash === currentHash ) {
                    discordCrypt.log( `No Update Needed - #${shortHash}` );
                    return true;
                }

                /* Try parsing a version number. */
                let version_number = '';
                try {
                    version_number = data.match( /('[0-9]+\.[0-9]+\.[0-9]+')/gi ).toString().replace( /('*')/g, '' );
                }
                catch ( e ) {
                    discordCrypt.log( 'Failed to locate the version number in the update ...', 'warn' );
                }

                /* Now get the changelog. */
                try {
                    /* Fetch the changelog from the URL. */
                    discordCrypt.__getRequest( changelog_url, ( statusCode, errorString, changelog ) => {
                        /* Perform the callback. */
                        on_update_callback( data, shortHash, version_number, statusCode == 200 ? changelog : '' );
                    } );
                }
                catch ( e ) {
                    discordCrypt.log( 'Error fetching the changelog.', 'warn' );

                    /* Perform the callback without a changelog. */
                    on_update_callback( data, shortHash, version_number, '' );
                }
            } );
        }
        catch ( ex ) {
            /* Handle failure. */
            discordCrypt.log( `Error while retrieving update: ${ex.toString()}`, 'warn' );
            return false;
        }

        return true;
    }

    /**
     * @private
     * @description Returns the current message ID used by Discord.
     * @returns {string | undefined}
     * @example
     * console.log( discordCrypt.getChannelId() );
     * // "414714693498014617"
     */
    static getChannelId() {
        return window.location.pathname.split( '/' ).pop();
    }

    /**
     * @public
     * @desc Creates a password object using a primary and secondary password.
     * @param {string} primary_password The primary password.
     * @param {string} secondary_password The secondary password.
     * @returns {ChannelPassword} Object containing the two passwords.
     * console.log( discordCrypt.createPassword( 'Hello', 'World' ) );
     * // Object {primary: "Hello", secondary: "World"}
     */
    static createPassword( primary_password, secondary_password ) {
        return { primary: primary_password, secondary: secondary_password };
    }

    /**
     * @public
     * @desc Returns functions to locate exported webpack modules.
     * @returns {{find, findByUniqueProperties, findByDisplayName, findByDispatchToken, findByDispatchNames}}
     */
    static getWebpackModuleSearcher() {
        /* [ Credits to the creator. ] */
        const req = typeof( webpackJsonp ) === "function" ?
            webpackJsonp(
                [],
                { '__extra_id__': ( module, _export_, req ) => _export_.default = req },
                [ '__extra_id__' ]
            ).default :
            webpackJsonp.push( [
                [],
                { '__extra_id__': ( _module_, exports, req ) => _module_.exports = req },
                [ [ '__extra_id__' ] ] ]
            );

        delete req.m[ '__extra_id__' ];
        delete req.c[ '__extra_id__' ];

        /**
         * @desc Look through all modules of internal Discord's Webpack and return first one that matches filter
         *      predicate. At first this function will look through already loaded modules cache.
         *      If no loaded modules match, then this function tries to load all modules and match for them.
         *      Loading any module may have unexpected side effects, like changing current locale of moment.js,
         *      so in that case there will be a warning the console.
         *      If no module matches, this function returns `null`.
         *      ou should always try to provide a predicate that will match something,
         *      but your code should be ready to receive `null` in case of changes in Discord's codebase.
         *      If module is ES6 module and has default property, consider default first;
         *      otherwise, consider the full module object.
         * @param {ModulePredicate} filter Predicate to match module
         * @param {boolean} force_load Whether to force load all modules if cached modules don't work.
         * @return {*} First module that matches `filter` or `null` if none match.
         */
        const find = ( filter, force_load ) => {
            for ( let i in req.c ) {
                if ( req.c.hasOwnProperty( i ) ) {
                    let m = req.c[ i ].exports;

                    if ( m && m.__esModule && m.default )
                        m = m.default;

                    if ( m && filter( m ) )
                        return m;
                }
            }

            if ( force_load ) {
                discordCrypt.log( "Couldn't find module in existing cache. Loading all modules.", 'warn' );

                for ( let i = 0; i < req.m.length; ++i ) {
                    try {
                        let m = req( i );
                        if ( m && m.__esModule && m.default && filter( m.default ) )
                            return m.default;
                        if ( m && filter( m ) )
                            return m;
                    }
                    catch ( e ) {
                        discordCrypt.log( `Could not load module index ${i} ...`, 'warn' );
                    }
                }

                discordCrypt.log( 'Cannot find React module.', 'warn' );
            }

            return null;
        };

        /**
         * @desc Look through all modules of internal Discord's Webpack and return first object that has all of
         *      following properties. You should be ready that in any moment, after Discord update,
         *      this function may start returning `null` (if no such object exists anymore) or even some
         *      different object with the same properties. So you should provide all property names that
         *      you use, and often even some extra properties to make sure you'll get exactly what you want.
         * @param {string[]} propNames Array of property names to look for.
         * @param {boolean} [force_load] Whether to force load all modules if cached modules don't work.
         * @returns {object} First module that matches `propNames` or `null` if none match.
         */
        const findByUniqueProperties = ( propNames, force_load = false ) =>
            find( module => propNames.every( prop => module[ prop ] !== undefined ), force_load );

        /**
         * @desc Look through all modules of internal Discord's Webpack and return first object that has
         *      `displayName` property with following value. This is useful for searching for React components by
         *      name. Take into account that not all components are exported as modules. Also, there might be
         *      several components with the same name.
         * @param {string} displayName Display name property value to look for.
         * @param {boolean} [force_load] Whether to force load all modules if cached modules don't work.
         * @return {object} First module that matches `displayName` or `null` if none match.
         */
        const findByDisplayName = ( displayName, force_load = false ) =>
            find( module => module.displayName === displayName, force_load );

        /**
         * @desc Look through all modules of internal Discord's Webpack and return the first object that matches
         *      a dispatch token's ID. These usually contain a bundle of `_actionHandlers` used to handle events
         *      internally.
         * @param {int} token The internal token ID number.
         * @param {boolean} [force_load] Whether to force load all modules if cached modules don't work.
         * @return {object} First module that matches the dispatch ID or `null` if none match.
         */
        const findByDispatchToken = ( token, force_load = false ) =>
            find( module =>
                module[ '_dispatchToken' ] !== undefined &&
                module[ '_dispatchToken' ] === `ID_${token}` &&
                module[ '_actionHandlers' ] !== undefined,
                force_load
            );

        /**
         * @desc Look through all modules of internal Discord's Webpack and return the first object that matches
         *      every dispatcher name provided.
         * @param {string[]} dispatchNames Names of events to search for.
         * @return {object} First module that matches every dispatch name provided or null if no full matches.
         */
        const findByDispatchNames = dispatchNames => {
            for ( let i = 0; i < 500; i++ ) {
                let dispatcher = findByDispatchToken( i );

                if ( !dispatcher )
                    continue;

                if ( dispatchNames.every( prop => dispatcher._actionHandlers.hasOwnProperty( prop ) ) )
                    return dispatcher;
            }
            return null;
        };

        return { find, findByUniqueProperties, findByDisplayName, findByDispatchToken, findByDispatchNames };
    }

    /**
     * @private
     * @experimental
     * @desc Dumps all function callback handlers with their names, IDs and function prototypes. [ Debug Function ]
     * @param {boolean} dump_actions Whether to dump action handlers.
     * @returns {Array} Returns an array of all IDs and identifier callbacks.
     */
    static dumpWebpackModuleCallbacks( dump_actions = true ) {
        /* Resolve the finder function. */
        let finder = discordCrypt.getWebpackModuleSearcher().findByDispatchToken;

        /* Create the dumping array. */
        let dump = [];

        /* Iterate over let's say 1000 possible modules ? */
        for ( let i = 0; i < 1000; i++ ) {
            /* Locate the module. */
            let module = finder( i );

            /* Skip if it's invalid. */
            if ( !module )
                continue;

            /* Create an entry in the array. */
            dump[ i ] = {};

            /* Loop over every property in the module. */
            for( let prop in module ) {
                /* Skip dependencies. */
                if( prop == '_dependencies' )
                    continue;

                /* Dump action handlers. */
                if( prop == '_actionHandlers' || prop == '_changeCallbacks' ) {
                    /* Skip if not required. */
                    if( !dump_actions )
                        continue;

                    dump[ i ][ prop ] = {};

                    /* Loop over every property name in the action handler. */
                    for ( let action in module[ prop ] ) {

                        /* Quick sanity check. */
                        if ( !module._actionHandlers.hasOwnProperty( action ) )
                            continue;

                        /* Assign the module property name and it's basic prototype. */
                        dump[ i ][ prop ][ action ] =
                            module[ prop ][ action ].prototype.constructor.toString().split( '{' )[ 0 ];
                    }
                }
                else {
                    /* Add the actual property name and its prototype. */
                    dump[ i ][ prop ] = module[ prop ].toString().split( '{' )[ 0 ];
                }
            }
        }

        /* Return any found module handlers. */
        return dump;
    }

    /**
     * @private
     * @desc Returns the React modules loaded natively in Discord.
     * @param {CachedModules} cached_modules Cached module parameter for locating standard modules.
     * @returns {ReactModules}
     */
    static getReactModules( cached_modules ) {
        const blacklisted_channel_props = [
            '@me',
            'activity'
        ];

        if ( cached_modules ) {
            return {
                ChannelProps:
                    blacklisted_channel_props.indexOf( discordCrypt.getChannelId() ) !== -1 ?
                        null :
                        discordCrypt.__getElementReactOwner( $( 'form' )[ 0 ] ).props.channel,
                MessageParser: cached_modules.MessageParser,
                MessageController: cached_modules.MessageController,
                MessageActionTypes: cached_modules.MessageActionTypes,
                MessageDispatcher: cached_modules.MessageDispatcher,
                MessageQueue: cached_modules.MessageQueue,
                UserResolver: cached_modules.UserResolver,
                GuildResolver: cached_modules.GuildResolver,
                ChannelResolver: cached_modules.ChannelResolver,
                HighlightJS: cached_modules.HighlightJS,
            };
        }

        return null;
    }

    /**
     * @desc Edits the message's content from the channel indicated.
     *      N.B. This does not edit embeds due to the internal code Discord uses.
     * @param {string} channel_id The channel's identifier that the message is located in.
     * @param {string} message_id The message's identifier to delete.
     * @param {string} content The message's new content.
     * @param {CachedModules} cached_modules The internally cached module objects.
     */
    static editMessage( channel_id, message_id, content, cached_modules ) {
        /* Edit the message internally. */
        cached_modules.MessageController.editMessage( channel_id, message_id, { content: content } );
    }

    /**
     * @desc Delete the message from the channel indicated.
     * @param {string} channel_id The channel's identifier that the message is located in.
     * @param {string} message_id The message's identifier to delete.
     * @param {CachedModules} cached_modules The internally cached module objects.
     */
    static deleteMessage( channel_id, message_id, cached_modules ) {
        /* Delete the message internally. */
        cached_modules.MessageController.deleteMessage( channel_id, message_id );
    }

    /**
     * @private
     * @desc Sends either an embedded message or an inline message to Discord.
     * @param {boolean} as_embed Whether to dispatch this message as an embed or not.
     * @param {string} main_message The main content to send.
     * @param {string} [message_header] The text to display at the top of an embed.
     * @param {string} [message_footer] The text to display at the bottom of an embed.
     * @param {int} [embedded_color] A hex color used to outline the left side of the embed if applicable.
     * @param {string} [message_content] Message content to be attached above the main message.
     * @param {int} [channel_id] If specified, sends the embedded message to this channel instead of the
     *      current channel.
     * @param {CachedModules} cached_modules Internally cached modules.
     * @param {Array<TimedMessage>} timed_messages Array containing timed messages to add this sent message to.
     * @param {int} expire_time_minutes The amount of minutes till this message is to be deleted.
     */
    static dispatchMessage(
        as_embed,
        main_message,
        message_header,
        message_footer,
        embedded_color = 0x551A8B,
        message_content = '',
        channel_id = undefined,
        cached_modules = undefined,
        timed_messages = undefined,
        expire_time_minutes = 0
    ) {
        let mention_everyone = false;

        /* Finds appropriate React modules. */
        const React = discordCrypt.getReactModules( cached_modules );

        /* Parse the message content to the required format if applicable.. */
        if ( typeof message_content === 'string' && message_content.length ) {
            /* Sanity check. */
            if ( React.MessageParser === null ) {
                discordCrypt.log( 'Could not locate the MessageParser module!', 'error' );
                return;
            }

            try {
                /* Parse the message. */
                message_content = React.MessageParser.parse( React.ChannelProps, message_content ).content;

                /* Check for @everyone or @here mentions. */
                if ( message_content.includes( '@everyone' ) || message_content.includes( '@here' ) )
                    mention_everyone = true;
            }
            catch ( e ) {
                message_content = '';
            }
        }
        else
            message_content = '';

        /* Save the Channel ID. */
        let _channel = channel_id !== undefined ? channel_id : discordCrypt.getChannelId();

        /* Sanity check. */
        if ( React.MessageQueue === null ) {
            discordCrypt.log( 'Could not locate the MessageQueue module!', 'error' );
            return;
        }

        /* Sanity check. */
        if ( React.MessageController === null ) {
            discordCrypt.log( 'Could not locate the MessageController module!', 'error' );
            return;
        }

        /* Handles returns for messages. */
        const onDispatchResponse = ( r ) => {
            /* Check if an error occurred and inform Clyde bot about it. */
            if ( !r.ok ) {
                /* Perform Clyde dispatch if necessary. */
                if (
                    r.status >= 400 &&
                    r.status < 500 &&
                    r.body &&
                    !React.MessageController.sendClydeError( _channel, r.body.code )
                ) {
                    /* Log the error in case we can't manually dispatch the error. */
                    discordCrypt.log( `Error sending message: ${r.status}`, 'error' );

                    /* Sanity check. */
                    if ( React.MessageDispatcher === null || React.MessageActionTypes === null ) {
                        discordCrypt.log( 'Could not locate the MessageDispatcher module!', 'error' );
                        return;
                    }

                    React.MessageDispatcher.dispatch( {
                        type: React.MessageActionTypes.ActionTypes.MESSAGE_SEND_FAILED,
                        messageId: _nonce,
                        channelId: _channel
                    } );
                }
            }
            else {
                /* Receive the message normally. */
                React.MessageController.receiveMessage( _channel, r.body );

                /* Add the message to the TimedMessage array. */
                if ( timed_messages && expire_time_minutes > 0 ) {
                    timed_messages.push( {
                        messageId: r.body.id,
                        channelId: _channel,
                        expireTime: Date.now() + ( expire_time_minutes * 60000 )
                    } );
                }
            }
        };

        /* Send this message as an embed. */
        if ( as_embed ) {
            /* Generate a unique nonce for this message. */
            let _nonce = parseInt( require( 'crypto' ).pseudoRandomBytes( 6 ).toString( 'hex' ), 16 );

            /* Create the message embed object and add it to the queue. */
            React.MessageQueue.enqueue(
                {
                    type: 'send',
                    message: {
                        channelId: _channel,
                        nonce: _nonce,
                        content: message_content,
                        mention_everyone: mention_everyone,
                        tts: false,
                        embed: {
                            type: "rich",
                            url: "https://gitlab.com/leogx9r/DiscordCrypt",
                            color: embedded_color || 0x551A8B,
                            output_mime_type: "text/x-html",
                            timestamp: ( new Date() ).toISOString(),
                            encoding: "utf-16",
                            author: {
                                name: message_header || '-----MESSAGE-----',
                                icon_url: 'https://gitlab.com/leogx9r/DiscordCrypt/raw/master/images/encode-logo.png',
                                url: 'https://discord.me/discordCrypt'
                            },
                            footer: {
                                text: message_footer || 'DiscordCrypt',
                                icon_url: 'https://gitlab.com/leogx9r/DiscordCrypt/raw/master/images/app-logo.png',
                            },
                            description: main_message,
                        }
                    }
                },
                onDispatchResponse
            );

            return;
        }

        /* Dispatch the message as normal content. */
        [
            main_message,
            message_content
        ].forEach(
            ( ( value ) => {
                /* Skip empty values. */
                if ( !value.length )
                    return;

                /* Generate a unique nonce for this message. */
                let _nonce = parseInt( require( 'crypto' ).pseudoRandomBytes( 6 ).toString( 'hex' ), 16 );

                /* Create the message object and dispatch it to the queue. */
                React.MessageQueue.enqueue(
                    {
                        type: 'send',
                        message: {
                            channelId: _channel,
                            nonce: _nonce,
                            content: value === message_content ? value : `\`${value}\``,
                            mention_everyone: value === message_content ? mention_everyone : false,
                            tts: false
                        }
                    },
                    onDispatchResponse
                );
            } )
        );
    }

    /**
     * @public
     * @desc Logs a message to the console in HTML coloring. ( For Electron clients. )
     * @param {string} message The message to log to the console.
     * @param {string} method The indication level of the message.
     *      This can be either ['info', 'warn', 'error', 'success']
     *
     * @example
     * log( 'Hello World!' );
     *
     * @example
     * log( 'This is printed in yellow.', 'warn' );
     *
     * @example
     * log( 'This is printed in red.', 'error' );
     *
     * @example
     * log( 'This is printed green.', 'trace' );
     *
     * @example
     * log( 'This is printed green.', 'debug' );
     *
     */
    static log( message, method = "info" ) {
        try {
            console[ method ]( `%c[DiscordCrypt]%c - ${message}`, "color: #7f007f; font-weight: bold;", "" );
        }
        catch ( ex ) {
            console.error( '[DiscordCrypt] - Error logging message ...' );
        }
    }

    /**
     * @private
     * @desc Injects a CSS style element into the header tag.
     * @param {string} id The HTML ID string used to identify this CSS style segment.
     * @param {string} css The actual CSS style excluding the <style> tags.
     * @example
     * injectCSS( 'my-css', 'p { font-size: 32px; }' );
     */
    static injectCSS( id, css ) {
        /* Inject into the header tag. */
        $( "head" )
            .append( $( "<style>", { id: id.replace( /^[^a-z]+|[^\w-]+/gi, "" ), html: css } ) )
    }

    /**
     * @private
     * @desc Clears an injected element via its ID tag.
     * @param {string} id The HTML ID string used to identify this CSS style segment.
     * @example
     * clearCSS( 'my-css' );
     */
    static clearCSS( id = undefined ) {
        /* Make sure the ID is a valid string. */
        if ( !id || typeof id !== 'string' || !id.length )
            return;

        /* Remove the element. */
        $( `#${id.replace( /^[^a-z]+|[^\w-]+/gi, "" )}` ).remove();
    }

    /* ================= END PROJECT UTILITIES ================= */

    /* ================= BEGIN MAIN CALLBACKS ================== */

    /**
     * @desc Hooks a dispatcher from Discord's internals.
     * @author samogot
     * @param {object} dispatcher The action dispatcher containing an array of _actionHandlers.
     * @param {string} method_name The name of the method to hook.
     * @param {string} options The type of hook to apply. [ 'before', 'after', 'instead', 'revert' ]
     * @param {boolean} [options.once=false] Set to `true` if you want to automatically unhook method after first call.
     * @param {boolean} [options.silent=false] Set to `true` if you want to suppress log messages about patching and
     *      unhooking. Useful to avoid clogging the console in case of frequent conditional hooking/unhooking, for
     *      example from another monkeyPatch callback.
     * @return {function} Returns the function used to cancel the hook.
     */
    static hookDispatcher( dispatcher, method_name, options ) {
        const { before, after, instead, once = false, silent = false } = options;
        const origMethod = dispatcher._actionHandlers[ method_name ];

        const cancel = () => {
            if ( !silent )
                discordCrypt.log( `Unhooking "${method_name}" ...` );
            dispatcher[ method_name ] = origMethod;
        };

        const suppressErrors = ( method, description ) => ( ... params ) => {
            try {
                return method( ... params );
            }
            catch ( e ) {
                discordCrypt.log( `Error occurred in ${description}`, 'error' )
            }
        };

        if ( !dispatcher._actionHandlers[ method_name ].__hooked ) {
            if ( !silent )
                discordCrypt.log( `Hooking "${method_name}" ...` );

            dispatcher._actionHandlers[ method_name ] = function () {
                /**
                 * @interface
                 * @name PatchData
                 * @property {object} thisObject Original `this` value in current call of patched method.
                 * @property {Arguments} methodArguments Original `arguments` object in current call of patched method.
                 *      Please, never change function signatures, as it may cause a lot of problems in future.
                 * @property {cancelPatch} cancelPatch Function with no arguments and no return value that may be called
                 *      to reverse patching of current method. Calling this function prevents running of this callback
                 *      on further original method calls.
                 * @property {function} originalMethod Reference to the original method that is patched. You can use it
                 *      if you need some special usage. You should explicitly provide a value for `this` and any method
                 *      arguments when you call this function.
                 * @property {function} callOriginalMethod This is a shortcut for calling original method using `this`
                 *      and `arguments` from original call.
                 * @property {*} returnValue This is a value returned from original function call. This property is
                 *      available only in `after` callback or in `instead` callback after calling `callOriginalMethod`
                 *      function.
                 */
                const data = {
                    thisObject: this,
                    methodArguments: arguments,
                    cancelPatch: cancel,
                    originalMethod: origMethod,
                    callOriginalMethod: () => data.returnValue =
                        data.originalMethod.apply( data.thisObject, data.methodArguments )
                };
                if ( instead ) {
                    const tempRet =
                        suppressErrors( instead, `${method_name} called hook via 'instead'.` )( data );

                    if ( tempRet !== undefined )
                        data.returnValue = tempRet;
                }
                else {

                    if ( before )
                        suppressErrors( before, `${method_name} called hook via 'before'.` )( data );

                    data.callOriginalMethod();

                    if ( after )
                        suppressErrors( after, `${method_name} called hook via 'after'.` )( data );
                }
                if ( once )
                    cancel();

                return data.returnValue;
            };

            dispatcher._actionHandlers[ method_name ].__hooked = true;
            dispatcher._actionHandlers[ method_name ].__cancel = cancel;
        }
        return dispatcher._actionHandlers[ method_name ].__cancel;
    }

    /**
     * @private
     * @desc Debug function that attempts to hook Discord's internal event handlers for message creation.
     * @return {boolean} Returns true if handler events have been hooked.
     */
    hookMessageCallbacks() {
        /* Find the main switch event dispatcher if not already found. */
        if ( !this.messageUpdateDispatcher ) {
            /* Usually ID_78. */
            this.messageUpdateDispatcher = discordCrypt.getWebpackModuleSearcher().findByDispatchNames( [
                'LOAD_MESSAGES',
                'LOAD_MESSAGES_SUCCESS',
                'LOAD_MESSAGES_FAILURE',
                'TRUNCATE_MESSAGES',
                'MESSAGE_CREATE',
                'MESSAGE_UPDATE',
                'MESSAGE_DELETE',
                'MESSAGE_DELETE_BULK',
                'MESSAGE_REVEAL',
                'CHANNEL_SELECT',
                'CHANNEL_CREATE',
                'CHANNEL_PRELOAD',
                'GUILD_CREATE',
                'GUILD_SELECT',
                'GUILD_DELETE'
            ] );
        }

        /* Don't proceed if it failed. */
        if ( !this.messageUpdateDispatcher ) {
            discordCrypt.log( `Failed to locate the switch event dispatcher!`, 'error' );
            return false;
        }

        /* Hook the switch event dispatcher. */
        discordCrypt.hookDispatcher(
            this.messageUpdateDispatcher,
            'CHANNEL_SELECT',
            {
                after: ( e ) => {
                    /* Skip channels not currently selected. */
                    if ( discordCrypt.getChannelId() !== e.methodArguments[ 0 ].channelId )
                        return;

                    /* Delays are required due to windows being loaded async. */
                    setTimeout(
                        () => {
                            discordCrypt.log( 'Detected chat switch.', 'debug' );

                            /* Add the toolbar. */
                            this.loadToolbar();

                            /* Attach the message handler. */
                            this.attachHandler();

                            /* Decrypt any messages. */
                            this.decodeMessages();
                        },
                        1
                    );
                }
            }
        );

        let messageUpdateEvent = {
            after: ( e ) => {
                /* Skip channels not currently selected. */
                if ( discordCrypt.getChannelId() !== e.methodArguments[ 0 ].channelId )
                    return;

                /* Delays are required due to windows being loaded async. */
                setTimeout(
                    () => {
                        /* Decrypt any messages. */
                        this.decodeMessages();
                    },
                    1
                );
            }
        };

        /* Hook incoming message creation dispatcher. */
        discordCrypt.hookDispatcher( this.messageUpdateDispatcher, 'MESSAGE_CREATE', messageUpdateEvent );
        discordCrypt.hookDispatcher( this.messageUpdateDispatcher, 'MESSAGE_UPDATE', messageUpdateEvent );
        discordCrypt.hookDispatcher( this.messageUpdateDispatcher, 'MESSAGE_DELETE', messageUpdateEvent );

        return true;
    }

    /**
     * @private
     * @desc Removes all hooks on modules hooked by the hookMessageCallbacks() function.
     * @return {boolean} Returns true if all methods have been unhooked.
     */
    unhookMessageCallbacks() {
        /* Skip if no dispatcher was called. */
        if ( !this.messageUpdateDispatcher )
            return false;

        /* Iterate over every dispatcher. */
        for ( let prop in this.messageUpdateDispatcher._actionHandlers ) {
            /* Search for the hooked property and call it. */
            if ( prop.hasOwnProperty( '__cancel' ) )
                prop.__cancel();
        }

        return true;
    }

    /**
     * @private
     * @desc Loads the master-password unlocking prompt.
     */
    loadMasterPassword() {
        const self = this;

        if ( $( '#dc-master-overlay' ).length !== 0 )
            return;

        /* Check if the database exists. */
        const cfg_exists = self.configExists();

        const action_msg = cfg_exists ? 'Unlock Database' : 'Create Database';

        /* Construct the password updating field. */
        $( document.body ).prepend( this.masterPasswordHtml );

        const pwd_field = $( '#dc-db-password' );
        const cancel_btn = $( '#dc-cancel-btn' );
        const unlock_btn = $( '#dc-unlock-database-btn' );
        const master_status = $( '#dc-master-status' );
        const master_header_message = $( '#dc-header-master-msg' );
        const master_prompt_message = $( '#dc-prompt-master-msg' );

        /* Use these messages based on whether we're creating a database or unlocking it. */
        master_header_message.text(
            cfg_exists ?
                '---------- Database Is Locked ----------' :
                '---------- Database Not Found ----------'
        );
        master_prompt_message.text(
            cfg_exists ?
                'Enter Password:' :
                'Enter New Password:'
        );
        unlock_btn.text( action_msg );

        /* Force the database element to load. */
        document.getElementById( 'dc-master-overlay' ).style.display = 'block';

        /* Check for ENTER key press to execute unlocks. */
        pwd_field.on( "keydown", ( function ( e ) {
            let code = e.keyCode || e.which;

            /* Execute on ENTER/RETURN only. */
            if ( code !== 13 )
                return;

            unlock_btn.click();
        } ) );

        /* Handle unlock button clicks. */
        unlock_btn.click(
            discordCrypt.on_master_unlock_button_clicked(
                self,
                unlock_btn,
                cfg_exists,
                pwd_field,
                action_msg,
                master_status
            )
        );

        /* Handle cancel button presses. */
        cancel_btn.click( discordCrypt.on_master_cancel_button_clicked( self ) );
    }

    /**
     * @private
     * @desc Performs an async update checking and handles actually updating the current version if necessary.
     */
    checkForUpdates() {
        const self = this;

        setTimeout( () => {
            /* Proxy call. */
            try {
                discordCrypt.checkForUpdate( ( file_data, short_hash, new_version, full_changelog ) => {
                    const replacePath = require( 'path' )
                        .join( discordCrypt.getPluginsPath(), discordCrypt.getPluginName() );
                    const fs = require( 'fs' );

                    /* Alert the user of the update and changelog. */
                    $( '#dc-overlay' ).css( 'display', 'block' );
                    $( '#dc-update-overlay' ).css( 'display', 'block' );

                    /* Update the version info. */
                    $( '#dc-new-version' )
                        .text( `New Version: ${new_version === '' ? 'N/A' : new_version} ( #${short_hash} )` );
                    $( '#dc-old-version' ).text( `Old Version: ${self.getVersion()}` );

                    /* Update the changelog. */
                    let dc_changelog = $( '#dc-changelog' );
                    dc_changelog.val(
                        typeof full_changelog === "string" && full_changelog.length > 0 ?
                            full_changelog :
                            'N/A'
                    );

                    /* Scroll to the top of the changelog. */
                    dc_changelog.scrollTop( 0 );

                    /* Replace the file. */
                    fs.writeFile( replacePath, file_data, ( err ) => {
                        if ( err ) {
                            discordCrypt.log(
                                `Unable to replace the target plugin. ( ${err} )\nDestination: ${replacePath}`, 'error'
                            );
                            _alert( 'Error During Update', 'Failed to apply the update!' );
                        }
                    } );
                } );
            }
            catch ( ex ) {
                discordCrypt.log( ex, 'warn' );
            }
        }, 1000 );
    }

    /**
     * @private
     * @desc Sets the active tab index in the settings menu.
     * @param {int} index The index ( 0-1 ) of the page to activate.
     * @example
     * setActiveTab( 1 );
     */
    static setActiveSettingsTab( index ) {
        let tab_names = [ 'dc-plugin-settings-tab', 'dc-database-settings-tab' ];
        let tabs = $( '#dc-settings-tab .dc-tab-link' );

        /* Hide all tabs. */
        for ( let i = 0; i < tab_names.length; i++ )
            $( `#${tab_names[ i ]}` ).css( 'display', 'none' );

        /* Deactivate all links. */
        tabs.removeClass( 'active' );

        switch ( index ) {
            case 0:
                $( '#dc-plugin-settings-btn' ).addClass( 'active' );
                $( '#dc-plugin-settings-tab' ).css( 'display', 'block' );
                break;
            case 1:
                $( '#dc-database-settings-btn' ).addClass( 'active' );
                $( '#dc-database-settings-tab' ).css( 'display', 'block' );
                break;
            default:
                break;
        }
    }

    /**
     * @private
     * @desc Sets the active tab index in the exchange key menu.
     * @param {int} index The index ( 0-2 ) of the page to activate.
     * @example
     * setActiveTab( 1 );
     */
    static setActiveExchangeTab( index ) {
        let tab_names = [ 'dc-about-tab', 'dc-keygen-tab', 'dc-handshake-tab' ];
        let tabs = $( '#dc-exchange-tab .dc-tab-link' );

        /* Hide all tabs. */
        for ( let i = 0; i < tab_names.length; i++ )
            $( `#${tab_names[ i ]}` ).css( 'display', 'none' );

        /* Deactivate all links. */
        tabs.removeClass( 'active' );

        switch ( index ) {
            case 0:
                $( '#dc-tab-info-btn' ).addClass( 'active' );
                $( '#dc-about-tab' ).css( 'display', 'block' );
                break;
            case 1:
                $( '#dc-tab-keygen-btn' ).addClass( 'active' );
                $( '#dc-keygen-tab' ).css( 'display', 'block' );
                break;
            case 2:
                $( '#dc-tab-handshake-btn' ).addClass( 'active' );
                $( '#dc-handshake-tab' ).css( 'display', 'block' );
                break;
            default:
                break;
        }
    }

    /**
     * @private
     * @desc Inserts the plugin's option toolbar to the current toolbar and handles all triggers.
     */
    loadToolbar() {

        /* Skip if the configuration hasn't been loaded. */
        if ( !this.configFile )
            return;

        /* Skip if we're not in an active channel. */
        if ( discordCrypt.getChannelId() === '@me' )
            return;

        /* Add toolbar buttons and their icons if it doesn't exist. */
        if ( $( '#dc-passwd-btn' ).length !== 0 )
            return;

        /* Inject the toolbar. */
        $( this.searchUiClass ).parent().parent().parent().prepend( this.toolbarHtml );

        /* Cache jQuery results. */
        let dc_passwd_btn = $( '#dc-passwd-btn' ),
            dc_lock_btn = $( '#dc-lock-btn' ),
            dc_svg = $( '.dc-svg' );

        /* Set the SVG button class. */
        dc_svg.attr( 'class', 'dc-svg' );

        /* Set the initial status icon. */
        if ( dc_lock_btn.length > 0 ) {
            if ( this.configFile.encodeAll ) {
                dc_lock_btn.attr( 'title', 'Disable Message Encryption' );
                dc_lock_btn.html( Buffer.from( this.lockIcon, 'base64' ).toString( 'utf8' ) );
            }
            else {
                dc_lock_btn.attr( 'title', 'Enable Message Encryption' );
                dc_lock_btn.html( Buffer.from( this.unlockIcon, 'base64' ).toString( 'utf8' ) );
            }

            /* Set the button class. */
            dc_svg.attr( 'class', 'dc-svg' );
        }

        /* Inject the settings. */
        $( document.body ).prepend( this.settingsMenuHtml );

        /* Also by default, set the about tab to be shown. */
        discordCrypt.setActiveSettingsTab( 0 );
        discordCrypt.setActiveExchangeTab( 0 );

        /* Update all settings from the settings panel. */
        $( '#dc-secondary-cipher' ).val( discordCrypt.cipherIndexToString( this.configFile.encryptMode, true ) );
        $( '#dc-primary-cipher' ).val( discordCrypt.cipherIndexToString( this.configFile.encryptMode, false ) );
        $( '#dc-settings-cipher-mode' ).val( this.configFile.encryptBlockMode.toLowerCase() );
        $( '#dc-settings-padding-mode' ).val( this.configFile.paddingMode.toLowerCase() );
        $( '#dc-settings-encrypt-trigger' ).val( this.configFile.encodeMessageTrigger );
        $( '#dc-settings-timed-expire' ).val( this.configFile.timedMessageExpires );
        $( '#dc-settings-default-pwd' ).val( this.configFile.defaultPassword );
        $( '#dc-settings-scan-delay' ).val( this.configFile.encryptScanDelay );
        $( '#dc-embed-enabled' ).prop( 'checked', this.configFile.useEmbeds );

        /* Handle clipboard upload button. */
        $( '#dc-clipboard-upload-btn' ).click( discordCrypt.on_upload_encrypted_clipboard_button_clicked( this ) );

        /* Handle file button clicked. */
        $( '#dc-file-btn' ).click( discordCrypt.on_file_button_clicked );

        /* Handle alter file path button. */
        $( '#dc-select-file-path-btn' ).click( discordCrypt.on_alter_file_button_clicked );

        /* Handle file upload button. */
        $( '#dc-file-upload-btn' ).click( discordCrypt.on_upload_file_button_clicked( this ) );

        /* Handle file button cancelled. */
        $( '#dc-file-cancel-btn' ).click( discordCrypt.on_cancel_file_upload_button_clicked );

        /* Handle Settings tab opening. */
        $( '#dc-settings-btn' ).click( discordCrypt.on_settings_button_clicked );

        /* Handle Plugin Settings tab selected. */
        $( '#dc-plugin-settings-btn' ).click( discordCrypt.on_plugin_settings_tab_button_clicked );

        /* Handle Database Settings tab selected. */
        $( '#dc-database-settings-btn' ).click( discordCrypt.on_database_settings_tab_button_clicked( this ) );

        /* Handle Database Import button. */
        $( '#dc-import-database-btn' ).click( discordCrypt.on_import_database_button_clicked( this ) );

        /* Handle Database Export button. */
        $( '#dc-export-database-btn' ).click( discordCrypt.on_export_database_button_clicked( this ) );

        /* Handle Clear Database Entries button. */
        $( '#dc-erase-entries-btn' ).click( discordCrypt.on_clear_entries_button_clicked( this ) );

        /* Handle Settings tab closing. */
        $( '#dc-exit-settings-btn' ).click( discordCrypt.on_settings_close_button_clicked );

        /* Handle Save settings. */
        $( '#dc-settings-save-btn' ).click( discordCrypt.on_save_settings_button_clicked( this ) );

        /* Handle Reset settings. */
        $( '#dc-settings-reset-btn' ).click( discordCrypt.on_reset_settings_button_clicked( this ) );

        /* Handle Restart-Now button clicking. */
        $( '#dc-restart-now-btn' ).click( discordCrypt.on_restart_now_button_clicked );

        /* Handle Restart-Later button clicking. */
        $( '#dc-restart-later-btn' ).click( discordCrypt.on_restart_later_button_clicked );

        /* Handle Info tab switch. */
        $( '#dc-tab-info-btn' ).click( discordCrypt.on_info_tab_button_clicked );

        /* Handle Keygen tab switch. */
        $( '#dc-tab-keygen-btn' ).click( discordCrypt.on_exchange_tab_button_clicked );

        /* Handle Handshake tab switch. */
        $( '#dc-tab-handshake-btn' ).click( discordCrypt.on_handshake_tab_button_clicked );

        /* Handle exit tab button. */
        $( '#dc-exit-exchange-btn' ).click( discordCrypt.on_close_exchange_button_clicked );

        /* Open exchange menu. */
        $( '#dc-exchange-btn' ).click( discordCrypt.on_open_exchange_button_clicked );

        /* Quickly generate and send a public key. */
        $( '#dc-quick-exchange-btn' ).click( discordCrypt.on_quick_send_public_key_button_clicked );

        /* Repopulate the bit length options for the generator when switching handshake algorithms. */
        $( '#dc-keygen-method' ).change( discordCrypt.on_exchange_algorithm_changed );

        /* Generate a new key-pair on clicking. */
        $( '#dc-keygen-gen-btn' ).click( discordCrypt.on_generate_new_key_pair_button_clicked );

        /* Clear the public & private key fields. */
        $( '#dc-keygen-clear-btn' ).click( discordCrypt.on_keygen_clear_button_clicked );

        /* Send the public key to the current channel. */
        $( '#dc-keygen-send-pub-btn' ).click( discordCrypt.on_keygen_send_public_key_button_clicked( this ) );

        /* Paste the data from the clipboard to the public key field. */
        $( '#dc-handshake-paste-btn' ).click( discordCrypt.on_handshake_paste_public_key_button_clicked );

        /* Compute the primary and secondary keys. */
        $( '#dc-handshake-compute-btn' ).click( discordCrypt.on_handshake_compute_button_clicked( this ) );

        /* Copy the primary and secondary key to the clipboard. */
        $( '#dc-handshake-cpy-keys-btn' ).click( discordCrypt.on_handshake_copy_keys_button_clicked );

        /* Apply generated keys to the current channel. */
        $( '#dc-handshake-apply-keys-btn' ).click( discordCrypt.on_handshake_apply_keys_button_clicked( this ) );

        /* Show the overlay when clicking the password button. */
        dc_passwd_btn.click( discordCrypt.on_passwd_button_clicked );

        /* Update the password for the user once clicked. */
        $( '#dc-save-pwd' ).click( discordCrypt.on_save_passwords_button_clicked( this ) );

        /* Reset the password for the user to the default. */
        $( '#dc-reset-pwd' ).click( discordCrypt.on_reset_passwords_button_clicked( this ) );

        /* Hide the overlay when clicking cancel. */
        $( '#dc-cancel-btn' ).click( discordCrypt.on_cancel_password_button_clicked );

        /* Copy the current passwords to the clipboard. */
        $( '#dc-cpy-pwds-btn' ).click( discordCrypt.on_copy_current_passwords_button_clicked( this ) );

        /* Set whether auto-encryption is enabled or disabled. */
        dc_lock_btn.click( discordCrypt.on_lock_button_clicked( this ) );
    }

    /**
     * @private
     * @desc Attached a handler to the message area and dispatches encrypted messages if necessary.
     */
    attachHandler() {
        const self = this;

        /* Get the text area. */
        let textarea = $( this.channelTextAreaClass );

        /* Make sure we got one element. */
        if ( textarea.length !== 1 )
            return;

        /* Replace any old handlers before adding the new one. */
        textarea.off( "keydown.dcrypt" ).on( "keydown.dcrypt", ( function ( e ) {
            let code = e.keyCode || e.which;

            /* Skip if we don't have a valid configuration. */
            if ( !self.configFile )
                return;

            /* Execute on ENTER/RETURN only. */
            if ( code !== 13 )
                return;

            /* Skip if shift key is down indicating going to a new line. */
            if ( e.shiftKey )
                return;

            /* Skip if autocomplete dialog is opened. */
            if ( !!$( self.autoCompleteClass )[ 0 ] )
                return;

            /* Send the encrypted message. */
            if ( self.sendEncryptedMessage( $( this ).val() ) != 0 )
                return;

            /* Clear text field. */
            discordCrypt.__getElementReactOwner( $( 'form' )[ 0 ] ).setState( { textValue: '' } );

            /* Cancel the default sending action. */
            e.preventDefault();
            e.stopPropagation();
        } ) );
    }

    /**
     * @private
     * @desc Parses a public key message and adds the exchange button to it if necessary.
     * @param {Object} obj The jQuery object of the current message being examined.
     * @returns {boolean} Returns true.
     */
    parseKeyMessage( obj ) {
        /* Extract the algorithm info from the message's metadata. */
        let metadata = discordCrypt.__extractKeyInfo( obj.text().replace( /\r?\n|\r/g, '' ), true );

        /* Sanity check for invalid key messages. */
        if ( metadata === null )
            return true;

        /* Compute the fingerprint of our currently known public key if any to determine if to proceed. */
        let local_fingerprint = discordCrypt.sha256( Buffer.from( $( '#dc-pub-key-ta' ).val(), 'hex' ), 'hex' );

        /* Skip if this is our current public key. */
        if ( metadata[ 'fingerprint' ] === local_fingerprint ) {
            obj.css( 'display', 'none' );
            return true;
        }

        /* Create a button allowing the user to perform a key exchange with this public key. */
        let button = $( "<button>Perform Key Exchange</button>" )
            .addClass( 'dc-button' )
            .addClass( 'dc-button-inverse' );

        /* Remove margins. */
        button.css( 'margin-left', '0' );
        button.css( 'margin-right', '0' );

        /* Move the button a bit down from the key's text. */
        button.css( 'margin-top', '2%' );

        /* Allow full width. */
        button.css( 'width', '100%' );

        /* Handle clicks. */
        button.click( ( function () {

            /* Cache jQuery results. */
            let dc_keygen_method = $( '#dc-keygen-method' ),
                dc_keygen_algorithm = $( '#dc-keygen-algorithm' );

            /* Simulate pressing the exchange key button. */
            $( '#dc-exchange-btn' ).click();

            /* If the current algorithm differs, change it and generate then send a new key. */
            if (
                dc_keygen_method.val() !== metadata[ 'algorithm' ] ||
                parseInt( dc_keygen_algorithm.val() ) !== metadata[ 'bit_length' ]
            ) {
                /* Switch. */
                dc_keygen_method.val( metadata[ 'algorithm' ] );

                /* Fire the change event so the second list updates. */
                dc_keygen_method.change();

                /* Update the key size. */
                dc_keygen_algorithm.val( metadata[ 'bit_length' ] );

                /* Generate a new key pair. */
                $( '#dc-keygen-gen-btn' ).click();

                /* Send the public key. */
                $( '#dc-keygen-send-pub-btn' ).click();
            }
            /* If we don't have a key yet, generate and send one. */
            else if ( $( '#dc-pub-key-ta' ).val() === '' ) {
                /* Generate a new key pair. */
                $( '#dc-keygen-gen-btn' ).click();

                /* Send the public key. */
                $( '#dc-keygen-send-pub-btn' ).click();
            }

            /* Open the handshake menu. */
            $( '#dc-tab-handshake-btn' ).click();

            /* Apply the key to the field. */
            $( '#dc-handshake-ppk' ).val( obj.text() );

            /* Click compute. */
            $( '#dc-handshake-compute-btn' ).click();
        } ) );

        /* Add the button. */
        obj.parent().append( button );

        /* Set the text to an identifiable color. */
        obj.css( 'color', 'blue' );

        return true;
    }

    /**
     * @private
     * @desc Parses a message object and attempts to decrypt it..
     * @param {Object} obj The jQuery object of the current message being examined.
     * @param {string} primary_key The primary key used to decrypt the message.
     * @param {string} secondary_key The secondary key used to decrypt the message.
     * @param {boolean} as_embed Whether to consider this message object as an embed.
     * @param {ReactModules} react_modules The modules retrieved by calling getReactModules()
     * @returns {boolean} Returns true if the message has been decrypted.
     */
    parseSymmetric( obj, primary_key, secondary_key, as_embed, react_modules ) {
        let message = $( obj );
        let dataMsg;

        /**************************************************************************************************************
         *  MESSAGE FORMAT:
         *
         *  + 0x0000 [ 4        Chars ] - Message Magic | Key Magic
         *  + 0x0004 [ 4 ( #4 ) Chars ] - Message Metadata ( #1 ) | Key Data ( #3 )
         *  + 0x000C [ ?        Chars ] - Cipher Text
         *
         *  * 0x0004 - Options - Substituted Base64 encoding of a single word stored in Little Endian.
         *      [ 31 ... 24 ] - Algorithm ( 0-24 = Dual )
         *      [ 23 ... 16 ] - Block Mode ( 0 = CBC | 1 = CFB | 2 = OFB )
         *      [ 15 ... 08 ] - Padding Mode ( #2 )
         *      [ 07 ... 00 ] - Random Padding Byte
         *
         *  #1 - Substitute( Base64( Encryption Algorithm << 24 | Padding Mode << 16 | Block Mode << 8 | RandomByte ) )
         *  #2 - ( 0 - PKCS #7 | 1 = ANSI X9.23 | 2 = ISO 10126 | 3 = ISO97971 )
         *  #3 - Substitute( Base64( ( Key Algorithm Type & 0xff ) + Public Key ) )
         *  #4 - 8 Byte Metadata For Messages Only
         *
         **************************************************************************************************************/

        /* Skip if the message is <= size of the total header. */
        if ( message.text().length <= 12 )
            return false;

        /* Split off the magic. */
        let magic = message.text().slice( 0, 4 );

        /* If this is a public key, just add a button and continue. */
        if ( magic === this.encodedKeyHeader )
            return this.parseKeyMessage( message );

        /* Make sure it has the correct header. */
        if ( magic !== this.encodedMessageHeader )
            return false;

        /* Try to deserialize the metadata. */
        let metadata = discordCrypt.metaDataDecode( message.text().slice( 4, 8 ) );

        /* Try looking for an algorithm, mode and padding type. */
        /* Algorithm first. */
        if ( metadata[ 0 ] >= this.encryptModes.length )
            return false;

        /* Cipher mode next. */
        if ( metadata[ 1 ] >= this.encryptBlockModes.length )
            return false;

        /* Padding after. */
        if ( metadata[ 2 ] >= this.paddingModes.length )
            return false;

        /* Decrypt the message. */
        dataMsg = discordCrypt.symmetricDecrypt( message.text().replace( /\r?\n|\r/g, '' )
            .substr( 8 ), primary_key, secondary_key, metadata[ 0 ], metadata[ 1 ], metadata[ 2 ], true );

        /* If decryption didn't fail, set the decoded text along with a green foreground. */
        if ( ( typeof dataMsg === 'string' || dataMsg instanceof String ) && dataMsg !== "" ) {
            /* If this is an embed, increase the maximum width of it. */
            if ( as_embed ) {
                /* Expand the message to the maximum width. */
                message.parent().parent().parent().parent().css( 'max-width', '100%' );
            }

            /* Process the message and apply all necessary element modifications. */
            dataMsg = discordCrypt.postProcessMessage( dataMsg, this.configFile.up1Host );

            /* Handle embeds and inline blocks differently. */
            if ( as_embed ) {
                /* Set the new HTML. */
                message.html( dataMsg.html );
            }
            else {
                /* For inline code blocks, we set the HTML to the parent element. */
                let tmp = message.parent();
                message.parent().html( dataMsg.html );

                /* And update the message object with the parent element. */
                message = $( tmp );
            }

            /* If this contains code blocks, highlight them. */
            if ( dataMsg.code ) {
                /* Sanity check. */
                if ( react_modules.HighlightJS !== null ) {
                    /* The inner element contains a <span></span> class, get all children beneath that. */
                    let elements = $( message.children()[ 0 ] ).children();

                    /* Loop over each element to get the markup division list. */
                    for ( let i = 0; i < elements.length; i++ ) {
                        /* Highlight the element's <pre><code></code></code> block. */
                        react_modules.HighlightJS.highlightBlock( $( elements[ i ] ).children()[ 0 ] );

                        /* Reset the class name. */
                        $( elements[ i ] ).children().addClass( 'hljs' );
                    }
                }
                else
                    discordCrypt.log( 'Could not locate HighlightJS module!', 'error' );
            }

            /* Decrypted messages get set to green. */
            message.css( 'color', 'green' );
        }
        else {
            /* If it failed, set a red foreground and set a decryption failure message to prevent further retries. */
            if ( dataMsg === 1 )
                message.text( '[ ERROR ] AUTHENTICATION OF CIPHER TEXT FAILED !!!' );
            else if ( dataMsg === 2 )
                message.text( '[ ERROR ] FAILED TO DECRYPT CIPHER TEXT !!!' );
            else
                message.text( '[ ERROR ] DECRYPTION FAILURE. INVALID KEY OR MALFORMED MESSAGE !!!' );
            message.css( 'color', 'red' );
        }

        /* Message has been parsed. */
        return true;
    }

    /**
     * @private
     * @desc Processes a decrypted message and formats any elements needed in HTML.
     * @param message The message to process.
     * @param {string} [embed_link_prefix] Optional search link prefix for URLs to embed in frames.
     * @returns {ProcessedMessage}
     */
    static postProcessMessage( message, embed_link_prefix ) {
        /* HTML escape characters. */
        const html_escape_characters = { '&': '&amp;', '<': '&lt', '>': '&gt;' };

        /* Remove any injected HTML. */
        message = message.replace( /[&<>]/g, x => html_escape_characters[ x ] );

        /* Extract any code blocks from the message. */
        let processed = discordCrypt.__buildCodeBlockMessage( message );
        let hasCode = processed.code;

        /* Extract any URLs. */
        processed = discordCrypt.__buildUrlMessage( processed.html, embed_link_prefix );
        let hasUrl = processed.url;

        /* Return the raw HTML. */
        return {
            url: hasUrl,
            code: hasCode,
            html: processed.html,
        };
    }

    /**
     * @private
     * @desc Iterates all messages in the current channel and tries to decrypt each, skipping cached results.
     */
    decodeMessages() {
        /* Skip if a valid configuration file has not been loaded. */
        if ( !this.configFile || !this.configFile.version )
            return;

        /* Save self. */
        const self = this;

        /* Get the current channel ID. */
        let id = discordCrypt.getChannelId();

        /* Use the default password for decryption if one hasn't been defined for this channel. */
        let primary = Buffer.from(
            this.configFile.passList[ id ] && this.configFile.passList[ id ].primary ?
                this.configFile.passList[ id ].primary :
                this.configFile.defaultPassword
        );
        let secondary = Buffer.from(
            this.configFile.passList[ id ] && this.configFile.passList[ id ].secondary ?
                this.configFile.passList[ id ].secondary :
                this.configFile.defaultPassword
        );

        /* Look through each markup element to find an embedDescription. */
        let React = discordCrypt.getReactModules( this.cachedModules );
        $( this.messageMarkupClass ).each( ( function () {
            /* Skip classes with no embeds. */
            if ( !this.className.includes( 'embedDescription' ) )
                return;

            /* Skip parsed messages. */
            if ( $( this ).data( 'dc-parsed' ) !== undefined )
                return;

            /* Try parsing a symmetric message. */
            self.parseSymmetric( this, primary, secondary, true, React );

            /* Set the flag. */
            $( this ).data( 'dc-parsed', true );
        } ) );

        /* Look through markup classes for inline code blocks. */
        $( `${this.messageMarkupClass} .inline` ).each( ( function () {
            /* Skip parsed messages. */
            if ( $( this ).data( 'dc-parsed' ) !== undefined )
                return;

            /* Try parsing a symmetric message. */
            self.parseSymmetric( this, primary, secondary, false, React );

            /* Set the flag. */
            $( this ).data( 'dc-parsed', true );
        } ) );
    }

    /**
     * @private
     * @desc Sends an encrypted message to the current channel.
     * @param {string} message The unencrypted message to send.
     * @param {boolean} force_send Whether to ignore checking for the encryption trigger and always encrypt and send.
     * @returns {number} Returns 1 if the message failed to be parsed correctly and 0 on success.
     * @param {int|undefined} channel_id If specified, sends the embedded message to this channel instead of the
     *      current channel.
     */
    sendEncryptedMessage( message, force_send = false, channel_id = undefined ) {
        /* Let's use a maximum message size of 1820 instead of 2000 to account for encoding, new line feeds & packet
         header. */
        const maximum_encoded_data = 1820;

        /* Add the message signal handler. */
        const escapeCharacters = [ "#", "/", ":" ];
        const crypto = require( 'crypto' );

        let cleaned;

        /* Skip messages starting with pre-defined escape characters. */
        if ( escapeCharacters.indexOf( message[ 0 ] ) !== -1 )
            return 1;

        /* If we're not encoding all messages or we don't have a password, strip off the magic string. */
        if ( force_send === false &&
            ( !this.configFile.passList[ discordCrypt.getChannelId() ] ||
                !this.configFile.passList[ discordCrypt.getChannelId() ].primary ||
                !this.configFile.encodeAll )
        ) {
            /* Try splitting via the defined split-arg. */
            message = message.split( '|' );

            /* Check if the message actually has the split arg. */
            if ( message.length <= 0 )
                return 1;

            /* Check if it has the trigger. */
            if ( message[ message.length - 1 ] !== this.configFile.encodeMessageTrigger )
                return 1;

            /* Use the first part of the message. */
            cleaned = message[ 0 ];
        }
        /* Make sure we have a valid password. */
        else {
            /* Use the whole message. */
            cleaned = message;
        }

        /* Check if we actually have a message ... */
        if ( cleaned.length === 0 )
            return 1;

        /* Try parsing any user-tags. */
        let parsed = discordCrypt.__extractTags( cleaned );

        /* Sanity check for messages with just spaces or new line feeds in it. */
        if ( parsed[ 0 ].length !== 0 ) {
            /* Extract the message to be encrypted. */
            cleaned = parsed[ 0 ];
        }

        /* Add content tags. */
        let user_tags = parsed[ 1 ].length > 0 ? parsed[ 1 ] : '';

        /* Get the passwords. */
        let primaryPassword = Buffer.from(
            this.configFile.passList[ discordCrypt.getChannelId() ] ?
                this.configFile.passList[ discordCrypt.getChannelId() ].primary :
                this.configFile.defaultPassword
        );

        let secondaryPassword = Buffer.from(
            this.configFile.passList[ discordCrypt.getChannelId() ] ?
                this.configFile.passList[ discordCrypt.getChannelId() ].secondary :
                this.configFile.defaultPassword
        );

        /* If the message length is less than the threshold, we can send it without splitting. */
        if ( ( cleaned.length + 16 ) < maximum_encoded_data ) {
            /* Encrypt the message. */
            let msg = discordCrypt.symmetricEncrypt(
                cleaned,
                primaryPassword,
                secondaryPassword,
                this.configFile.encryptMode,
                this.configFile.encryptBlockMode,
                this.configFile.paddingMode,
                true
            );

            /* Append the header to the message normally. */
            msg = this.encodedMessageHeader + discordCrypt.metaDataEncode
            (
                this.configFile.encryptMode,
                this.configFile.encryptBlockMode,
                this.configFile.paddingMode,
                parseInt( crypto.pseudoRandomBytes( 1 )[ 0 ] )
            ) + msg;

            /* Break up the message into lines. */
            msg = msg.replace( /(.{32})/g, ( e ) => {
                return `${e}\n`
            } );

            /* Send the message. */
            discordCrypt.dispatchMessage(
                this.configFile.useEmbeds,
                msg,
                this.messageHeader,
                `v${this.getVersion().replace( '-debug', '' )}`,
                0x551A8B,
                user_tags,
                channel_id,
                this.cachedModules,
                this.configFile.timedMessages,
                this.configFile.timedMessageExpires
            );
        }
        else {
            /* Determine how many packets we need to split this into. */
            let packets = discordCrypt.__splitStringChunks( cleaned, maximum_encoded_data );
            for ( let i = 0; i < packets.length; i++ ) {
                /* Encrypt the message. */
                let msg = discordCrypt.symmetricEncrypt(
                    packets[ i ],
                    primaryPassword,
                    secondaryPassword,
                    this.configFile.encryptMode,
                    this.configFile.encryptBlockMode,
                    this.configFile.paddingMode,
                    true
                );

                /* Append the header to the message normally. */
                msg = this.encodedMessageHeader + discordCrypt.metaDataEncode
                (
                    this.configFile.encryptMode,
                    this.configFile.encryptBlockMode,
                    this.configFile.paddingMode,
                    parseInt( crypto.pseudoRandomBytes( 1 )[ 0 ] )
                ) + msg;

                /* Break up the message into lines. */
                msg = msg.replace( /(.{32})/g, ( e ) => {
                    return `${e}\n`
                } );

                /* Send the message. */
                discordCrypt.dispatchMessage(
                    this.configFile.useEmbeds,
                    msg,
                    this.messageHeader,
                    `v${this.getVersion().replace( '-debug', '' )}`,
                    0x551A8B,
                    i === 0 ? user_tags : '',
                    channel_id,
                    this.cachedModules,
                    this.configFile.timedMessages,
                    this.configFile.timedMessageExpires
                );
            }
        }

        /* Save the configuration file and store the new message(s). */
        this.saveConfig();

        return 0;
    }

    /* =============== BEGIN UI HANDLE CALLBACKS =============== */

    /**
     * @desc Attempts to unlock the database upon startup.
     * @param {discordCrypt} self
     * @param {Object} unlock_btn
     * @param {boolean} cfg_exists
     * @param {Object} pwd_field
     * @param {string} action_msg
     * @param {Object} master_status
     * @return {Function}
     */
    static on_master_unlock_button_clicked( self, unlock_btn, cfg_exists, pwd_field, action_msg, master_status ) {
        return () => {
            /* Disable the button before clicking. */
            unlock_btn.attr( 'disabled', true );

            /* Update the text. */
            if ( cfg_exists )
                unlock_btn.text( 'Unlocking Database ...' );
            else
                unlock_btn.text( 'Creating Database ...' );

            /* Get the password entered. */
            let password = pwd_field.val();

            /* Validate the field entered contains some value. */
            if ( password === null || password === '' ) {
                unlock_btn.text( action_msg );
                unlock_btn.attr( 'disabled', false );
                return;
            }

            /* Hash the password. */
            discordCrypt.scrypt
            (
                Buffer.from( password ),
                Buffer.from( discordCrypt.whirlpool( password, true ), 'hex' ),
                32,
                4096,
                8,
                1,
                ( error, progress, pwd ) => {
                    if ( error ) {
                        /* Update the button's text. */
                        if ( cfg_exists )
                            unlock_btn.text( 'Invalid Password!' );
                        else
                            unlock_btn.text( `Error: ${error}` );

                        /* Clear the text field. */
                        pwd_field.val( '' );

                        /* Reset the progress bar. */
                        master_status.css( 'width', '0%' );

                        /* Reset the text of the button after 1 second. */
                        setTimeout( ( function () {
                            unlock_btn.text( action_msg );
                        } ), 1000 );

                        discordCrypt.log( error.toString(), 'error' );
                        return true;
                    }

                    if ( progress )
                        master_status.css( 'width', `${parseInt( progress * 100 )}%` );

                    if ( pwd ) {
                        /* To test whether this is the correct password or not, we have to attempt to use it. */
                        self.masterPassword = Buffer.from( pwd, 'hex' );

                        /* Attempt to load the database with this password. */
                        if ( !self.loadConfig() ) {
                            self.configFile = null;

                            /* Update the button's text. */
                            if ( cfg_exists )
                                unlock_btn.text( 'Invalid Password!' );
                            else
                                unlock_btn.text( 'Failed to create the database!' );

                            /* Clear the text field. */
                            pwd_field.val( '' );

                            /* Reset the progress bar. */
                            master_status.css( 'width', '0%' );

                            /* Reset the text of the button after 1 second. */
                            setTimeout( ( function () {
                                unlock_btn.text( action_msg );
                            } ), 1000 );

                            /* Proceed no further. */
                            unlock_btn.attr( 'disabled', false );
                            return false;
                        }

                        /* We may now call the start() function. */
                        self.start();

                        /* And update the button text. */
                        if ( cfg_exists )
                            unlock_btn.text( 'Unlocked Successfully!' );
                        else
                            unlock_btn.text( 'Created Successfully!' );

                        /* Close the overlay after 1 second. */
                        setTimeout( ( function () {
                            $( '#dc-master-overlay' ).remove();
                        } ), 1000 );
                    }

                    return false;
                }
            );
        }
    }

    /**
     * @desc Cancels loading the plugin when the unlocking cancel button is pressed.
     * @param {discordCrypt} self
     * @return {Function}
     */
    static on_master_cancel_button_clicked( self ) {
        return () => {
            /* Use a 300 millisecond delay. */
            setTimeout(
                ( function () {
                    /* Remove the prompt overlay. */
                    $( '#dc-master-overlay' ).remove();

                    /* Do some quick cleanup. */
                    self.masterPassword = null;
                    self.configFile = null;
                } ), 300
            );
        }
    }

    /**
     * @private
     * @desc Opens the file uploading menu.
     */
    static on_file_button_clicked() {
        /* Show main background. */
        $( '#dc-overlay' ).css( 'display', 'block' );

        /* Show the upload overlay. */
        $( '#dc-overlay-upload' ).css( 'display', 'block' );
    }

    /**
     * @private
     * @desc Opens the file menu selection.
     */
    static on_alter_file_button_clicked() {
        /* Create an input element. */
        let file = require( 'electron' ).remote.dialog.showOpenDialog( {
            title: 'Select a file to encrypt and upload',
            buttonLabel: 'Select',
            message: 'Maximum file size is 50 MB',
            properties: [ 'openFile', 'showHiddenFiles', 'treatPackageAsDirectory' ]
        } );

        /* Ignore if no file was selected. */
        if ( !file.length || !file[ 0 ].length )
            return;

        /* Set the file path to the selected path. */
        $( '#dc-file-path' ).val( file[ 0 ] );
    }

    /**
     * @private
     * @desc Uploads the clipboard's current contents and sends the encrypted link.
     * @param {discordCrypt} self
     * @returns {Function}
     */
    static on_upload_encrypted_clipboard_button_clicked( /* discordCrypt */ self ) {
        return () => {
            /* Since this is an async operation, we need to backup the channel ID before doing this. */
            let channel_id = discordCrypt.getChannelId();

            /* Upload the clipboard. */
            discordCrypt.__up1UploadClipboard(
                self.configFile.up1Host,
                self.configFile.up1ApiKey,
                global.sjcl,
                ( error_string, file_url, deletion_link ) => {
                    /* Do some sanity checking. */
                    if ( error_string !== null || typeof file_url !== 'string' || typeof deletion_link !== 'string' ) {
                        _alert( 'Failed to upload the clipboard!', error_string );
                        return;
                    }

                    /* Format and send the message. */
                    self.sendEncryptedMessage( `${file_url}`, true, channel_id );

                    /* Copy the deletion link to the clipboard. */
                    require( 'electron' ).clipboard.writeText( `Delete URL: ${deletion_link}` );
                }
            );
        };
    }

    /**
     * @private
     * @desc  Uploads the selected file and sends the encrypted link.
     * @param {discordCrypt} self
     * @returns {Function}
     */
    static on_upload_file_button_clicked( /* discordCrypt */ self ) {
        return () => {
            const fs = require( 'original-fs' );

            let file_path_field = $( '#dc-file-path' );
            let file_upload_btn = $( '#dc-file-upload-btn' );
            let message_textarea = $( '#dc-file-message-textarea' );
            let send_deletion_link = $( '#dc-file-deletion-checkbox' ).is( ':checked' );
            let randomize_file_name = $( '#dc-file-name-random-checkbox' ).is( ':checked' );

            /* Send the additional text first if it's valid. */
            if ( message_textarea.val().length > 0 )
                self.sendEncryptedMessage( message_textarea.val(), true );

            /* Since this is an async operation, we need to backup the channel ID before doing this. */
            let channel_id = discordCrypt.getChannelId();

            /* Clear the message field. */
            message_textarea.val( '' );

            /* Sanity check the file. */
            if ( !fs.existsSync( file_path_field.val() ) ) {
                file_path_field.val( '' );
                return;
            }

            /* Set the status text. */
            file_upload_btn.text( 'Uploading ...' );
            file_upload_btn.addClass( 'dc-button-inverse' );

            /* Upload the file. */
            discordCrypt.__up1UploadFile(
                file_path_field.val(),
                self.configFile.up1Host,
                self.configFile.up1ApiKey,
                global.sjcl,
                ( error_string, file_url, deletion_link ) => {
                    /* Do some sanity checking. */
                    if ( error_string !== null || typeof file_url !== 'string' || typeof deletion_link !== 'string' ) {
                        /* Set the status text. */
                        file_upload_btn.text( 'Failed to upload the file!' );
                        discordCrypt.log( error_string, 'error' );

                        /* Clear the file path. */
                        file_path_field.val( '' );

                        /* Reset the status text after 1 second. */
                        setTimeout( () => {
                            file_upload_btn.text( 'Upload' );
                            file_upload_btn.removeClass( 'dc-button-inverse' );
                        }, 1000 );

                        return;
                    }

                    /* Format and send the message. */
                    self.sendEncryptedMessage(
                        `${file_url}${send_deletion_link ? '\n\nDelete URL: ' + deletion_link : ''}`,
                        true,
                        channel_id
                    );

                    /* Clear the file path. */
                    file_path_field.val( '' );

                    /* Indicate success. */
                    file_upload_btn.text( 'Upload Successful!' );

                    /* Reset the status text after 1 second and close the dialog. */
                    setTimeout( () => {
                        file_upload_btn.text( 'Upload' );
                        file_upload_btn.removeClass( 'dc-button-inverse' );

                        /* Close. */
                        $( '#dc-file-cancel-btn' ).click();
                    }, 1000 );
                },
                randomize_file_name
            );
        };
    }

    /**
     * @private
     * @desc Closes the file upload dialog.
     */
    static on_cancel_file_upload_button_clicked() {
        /* Clear old file name. */
        $( '#dc-file-path' ).val( '' );

        /* Show main background. */
        $( '#dc-overlay' ).css( 'display', 'none' );

        /* Show the upload overlay. */
        $( '#dc-overlay-upload' ).css( 'display', 'none' );
    }

    /**
     * @private
     * @desc Opens the settings menu.
     */
    static on_settings_button_clicked() {
        /* Show main background. */
        $( '#dc-overlay' ).css( 'display', 'block' );

        /* Show the main settings menu. */
        $( '#dc-overlay-settings' ).css( 'display', 'block' );
    }

    /**
     * @private
     * @desc Selects the Plugin Settings tab.
     */
    static on_plugin_settings_tab_button_clicked() {
        /* Select the plugin settings. */
        discordCrypt.setActiveSettingsTab( 0 );
    }

    /**
     * @private
     * @desc Selects the Database Settings tab and loads key info.
     * @param {discordCrypt} self
     * @return {Function}
     */
    static on_database_settings_tab_button_clicked( self ) {
        return () => {
            let users, guilds, channels, table;

            /* Cache the table. */
            table = $( '#dc-database-entries' );

            /* Clear all entries. */
            table.html( '' );

            /* Resolve all users, guilds and channels the current user is a part of. */
            users = self.cachedModules.UserResolver.getUsers();
            guilds = self.cachedModules.GuildResolver.getGuilds();
            channels = self.cachedModules.ChannelResolver.getChannels();

            /* Iterate over each password in the configuration. */
            for ( let prop in self.configFile.passList ) {
                let name, id = prop;

                /* Skip channels that don't have an ID. */
                if ( !channels[ id ] )
                    continue;

                /* Check for the correct channel type. */
                if ( channels[ id ].type === 0 ) {
                    /* Guild Channel */
                    let guild = guilds[ channels[ id ].guild_id ];

                    /* Resolve the name as a "Guild @ #Channel" format. */
                    name = `${guild.name} @ #${channels[ id ].name}`;
                }
                else if ( channels[ id ].type === 1 ) {
                    /* DM */
                    let user = users[ channels[ id ].recipients[ 0 ] ];

                    /* Indicate this is a DM and give the full user name. */
                    name = `DM @${user.username}#${user.discriminator}`;
                }
                else
                    continue;

                /* Create the elements needed for building the row. */
                let element = $( `<tr><td>${id}</td><td>${name}</td><td></td></tr>` ),
                    btn = $( '<button>' )
                        .addClass( 'dc-button dc-button-small dc-button-inverse' )
                        .text( 'Delete' );

                /* Handle deletion clicks. */
                btn.click( function () {
                    /* Delete the entry. */
                    delete self.configFile.passList[ id ];

                    /* Save the configuration. */
                    self.saveConfig();

                    /* Remove the entire row. */
                    btn.parent().parent().remove();
                } );

                /* Append the button to the Options column. */
                $( element.children()[ 2 ] ).append( btn );

                /* Append the entire entry to the table. */
                table.append( element );
            }

            /* Select the database settings. */
            discordCrypt.setActiveSettingsTab( 1 );
        };
    }

    /**
     * @private
     * @desc Opens a file dialog to import a JSON encoded entries file.
     * @param self
     * @return {Function}
     */
    static on_import_database_button_clicked( self ) {
        return () => {
            /* Get the FS module. */
            const fs = require( 'fs' );

            /* Create an input element. */
            let files = require( 'electron' ).remote.dialog.showOpenDialog( {
                title: 'Import Database',
                message: 'Select the configuration file(s) to import',
                buttonLabel: 'Import',
                filters: [ {
                    name: 'Database Entries ( *.json )',
                    extensions: [ 'json' ]
                } ],
                properties: [ 'openFile', 'multiSelections', 'showHiddenFiles', 'treatPackageAsDirectory' ]
            } );

            /* Ignore if no files was selected. */
            if ( !files.length )
                return;

            /* Cache the button. */
            let import_btn = $( '#dc-import-database-btn' );

            /* For reference. */
            let imported = 0;

            /* Update the status. */
            import_btn.text( `Importing ( ${files.length} ) File(s)` );

            /* Loop over every file.  */
            for ( let i = 0; i < files.length; i++ ) {
                let file = files[ i ],
                    data;

                /* Sanity check. */
                if ( !fs.statSync( file ).isFile() )
                    continue;

                /* Read the file. */
                try {
                    data = JSON.parse( fs.readFileSync( file ).toString() );
                }
                catch ( e ) {
                    discordCrypt.log( `Error reading JSON file '${file} ...`, 'warn' );
                    continue;
                }

                /* Make sure the root element of entries exists. */
                if ( !data.discordCrypt_entries || !data.discordCrypt_entries.length )
                    continue;

                /* Iterate all entries. */
                for ( let j = 0; j < data.discordCrypt_entries.length; j++ ) {
                    let e = data.discordCrypt_entries[ j ];

                    /* Skip invalid entries. */
                    if ( !e.id || !e.primary || !e.secondary )
                        continue;

                    /* Determine if to count this as an import or an update which aren't counted. */
                    if ( !self.configFile.passList.hasOwnProperty( e.id ) ) {
                        /* Update the number imported. */
                        imported++;
                    }

                    /* Add it to the configuration file. */
                    self.configFile.passList[ e.id ] = discordCrypt.createPassword( e.primary, e.secondary );
                }
            }

            /* Update the button's text. */
            setTimeout( () => {
                import_btn.text( `Imported (${imported}) ${imported === 1 ? 'Entry' : 'Entries'}` );

                /* Reset the button's text. */
                setTimeout( () => {
                    import_btn.text( 'Import Database(s)' );
                }, 1000 );

            }, 500 );

            /* Determine if to save the database. */
            if ( imported !== 0 ) {
                /* Trigger updating the database entries field. */
                discordCrypt.on_database_settings_tab_button_clicked( self )();

                /* Save the configuration. */
                self.saveConfig();
            }
        };
    }

    /**
     * @private
     * @desc Opens a file dialog to import a JSON encoded entries file.
     * @param self
     * @return {Function}
     */
    static on_export_database_button_clicked( self ) {
        return () => {
            /* Create an input element. */
            let file = require( 'electron' ).remote.dialog.showSaveDialog( {
                title: 'Export Database',
                message: 'Select the destination file',
                buttonLabel: 'Export',
                filters: [ {
                    name: 'Database Entries ( *.json )',
                    extensions: [ 'json' ]
                } ]
            } );

            /* Ignore if no files was selected. */
            if ( !file.length )
                return;

            /* Get the FS module. */
            const fs = require( 'fs' );

            /* Cache the button. */
            let export_btn = $( '#dc-export-database-btn' );

            /* Create the main object for exporting. */
            let data = { discordCrypt_entries: [] },
                entries;

            /* Iterate each entry in the configuration file. */
            for ( let prop in self.configFile.passList ) {
                let e = self.configFile.passList[ prop ];

                /* Insert the entry to the list. */
                data.discordCrypt_entries.push( {
                    id: prop,
                    primary: e.primary,
                    secondary: e.secondary
                } );
            }

            /* Update the entry count. */
            entries = data.discordCrypt_entries.length;

            try {
                /* Try writing the file. */
                fs.writeFileSync( file, JSON.stringify( data, null, '    ' ) );

                /* Update the button's text. */
                export_btn.text( `Exported (${entries}) ${entries === 1 ? 'Entry' : 'Entries'}` );
            }
            catch ( e ) {
                /* Log an error. */
                discordCrypt.log( `Error exporting entries: ${e.toString()}`, 'error' );

                /* Update the button's text. */
                export_btn.text( 'Error: See Console' );
            }

            /* Reset the button's text. */
            setTimeout( () => {
                export_btn.text( 'Export Database' );
            }, 1000 );
        };
    }

    /**
     * @private
     * @desc Clears all entries in the database.
     * @param self
     * @return {Function}
     */
    static on_clear_entries_button_clicked( self ) {
        return () => {
            /* Cache the button. */
            let erase_entries_btn = $( '#dc-erase-entries-btn' );

            /* Remove all entries. */
            self.configFile.passList = {};

            /* Clear the table. */
            $( '#dc-database-entries' ).html( '' );

            /* Save the database. */
            self.saveConfig();

            /* Update the button's text. */
            erase_entries_btn.text( 'Cleared Entries' );

            /* Reset the button's text. */
            setTimeout( () => {
                erase_entries_btn.text( 'Erase Entries' );
            }, 1000 );
        };
    }

    /**
     * @private
     * @desc Closes the settings menu.
     */
    static on_settings_close_button_clicked() {
        /* Select the plugin settings. */
        discordCrypt.setActiveSettingsTab( 0 );

        /* Hide main background. */
        $( '#dc-overlay' ).css( 'display', 'none' );

        /* Hide the main settings menu. */
        $( '#dc-overlay-settings' ).css( 'display', 'none' );
    }

    /**
     * @private
     * @desc Saves all settings.
     * @param {discordCrypt} self
     * @returns {Function}
     */
    static on_save_settings_button_clicked( /* discordCrypt */ self ) {
        return () => {

            /* Cache jQuery results. */
            let dc_primary_cipher = $( '#dc-primary-cipher' ),
                dc_secondary_cipher = $( '#dc-secondary-cipher' ),
                dc_master_password = $( '#dc-master-password' );

            /* Update all settings from the settings panel. */
            self.configFile.encodeMessageTrigger = $( '#dc-settings-encrypt-trigger' ).val();
            self.configFile.timedMessageExpires = $( '#dc-settings-timed-expire' ).val();
            self.configFile.encryptBlockMode = $( '#dc-settings-cipher-mode' ).val();
            self.configFile.defaultPassword = $( '#dc-settings-default-pwd' ).val();
            self.configFile.encryptScanDelay = $( '#dc-settings-scan-delay' ).val();
            self.configFile.paddingMode = $( '#dc-settings-padding-mode' ).val();
            self.configFile.useEmbeds = $( '#dc-embed-enabled' ).is( ':checked' );
            self.configFile.encryptMode = discordCrypt
                .cipherStringToIndex( dc_primary_cipher.val(), dc_secondary_cipher.val() );

            dc_primary_cipher.val( discordCrypt.cipherIndexToString( self.configFile.encryptMode, false ) );
            dc_secondary_cipher.val( discordCrypt.cipherIndexToString( self.configFile.encryptMode, true ) );

            /* Handle master password updates if necessary. */
            if ( dc_master_password.val() !== '' ) {
                let password = dc_master_password.val();

                /* Reset the password field. */
                dc_master_password.val( '' );

                /* Hash the password. */
                discordCrypt.scrypt
                (
                    Buffer.from( password ),
                    Buffer.from( discordCrypt.whirlpool( password, true ), 'hex' ),
                    32,
                    4096,
                    8,
                    1,
                    ( error, progress, pwd ) => {
                        if ( error ) {
                            /* Alert the user. */
                            _alert(
                                'DiscordCrypt Error',
                                'Error setting the new database password. Check the console for more info.'
                            );

                            discordCrypt.log( error.toString(), 'error' );
                            return true;
                        }

                        if ( pwd ) {
                            /* Now update the password. */
                            self.masterPassword = Buffer.from( pwd, 'hex' );

                            /* Save the configuration file and update the button text. */
                            self.saveSettings( $( '#dc-settings-save-btn' ) );
                        }

                        return false;
                    }
                );
            }
            else {
                /* Save the configuration file and update the button text. */
                self.saveSettings( $( '#dc-settings-save-btn' ) );
            }
        };
    }

    /**
     * @private
     * @desc Resets the user settings to their default values.
     * @param {discordCrypt} self
     * @returns {Function}
     */
    static on_reset_settings_button_clicked( /* discordCrypt */ self ) {
        return () => {
            /* Resets the configuration file and update the button text. */
            self.resetSettings( $( '#dc-settings-reset-btn' ) );

            /* Update all settings from the settings panel. */
            $( '#dc-secondary-cipher' ).val( discordCrypt.cipherIndexToString( self.configFile.encryptMode, true ) );
            $( '#dc-primary-cipher' ).val( discordCrypt.cipherIndexToString( self.configFile.encryptMode, false ) );
            $( '#dc-settings-cipher-mode' ).val( self.configFile.encryptBlockMode.toLowerCase() );
            $( '#dc-settings-padding-mode' ).val( self.configFile.paddingMode.toLowerCase() );
            $( '#dc-settings-encrypt-trigger' ).val( self.configFile.encodeMessageTrigger );
            $( '#dc-settings-timed-expire' ).val( self.configFile.timedMessageExpires );
            $( '#dc-settings-default-pwd' ).val( self.configFile.defaultPassword );
            $( '#dc-settings-scan-delay' ).val( self.configFile.encryptScanDelay );
            $( '#dc-embed-enabled' ).prop( 'checked', self.configFile.useEmbeds );
            $( '#dc-master-password' ).val( '' );
        };
    }

    /**
     * @private
     * @desc Restarts the app by performing a window.location.reload()
     */
    static on_restart_now_button_clicked() {
        /* Window reload is simple enough. */
        location.reload();
    }

    /**
     * @private
     * @desc Closes the upload available panel.
     */
    static on_restart_later_button_clicked() {
        /* Hide the update and changelog. */
        $( '#dc-overlay' ).css( 'display', 'none' );
        $( '#dc-update-overlay' ).css( 'display', 'none' );
    }

    /**
     * @private
     * @desc Switches assets to the Info tab.
     */
    static on_info_tab_button_clicked() {
        /* Switch to tab 0. */
        discordCrypt.setActiveExchangeTab( 0 );
    }

    /**
     * @private
     * @desc Switches assets to the Key Exchange tab.
     */
    static on_exchange_tab_button_clicked() {
        /* Switch to tab 1. */
        discordCrypt.setActiveExchangeTab( 1 );
    }

    /**
     * @private
     * @desc Switches assets to the Handshake tab.
     */
    static on_handshake_tab_button_clicked() {
        /* Switch to tab 2. */
        discordCrypt.setActiveExchangeTab( 2 );
    }

    /**
     * @private
     * @desc Closes the key exchange menu.
     */
    static on_close_exchange_button_clicked() {
        /* Hide main background. */
        $( '#dc-overlay' ).css( 'display', 'none' );

        /* Hide the entire exchange key menu. */
        $( '#dc-overlay-exchange' ).css( 'display', 'none' );
    }

    /**
     * @private
     * @desc Opens the key exchange menu.
     */
    static on_open_exchange_button_clicked() {
        /* Show background. */
        $( '#dc-overlay' ).css( 'display', 'block' );

        /* Show main menu. */
        $( '#dc-overlay-exchange' ).css( 'display', 'block' );
    }

    /**
     * @private
     * @desc Generates and sends a new public key.
     */
    static on_quick_send_public_key_button_clicked() {
        /* Don't bother opening a menu. Just generate the key. */
        $( '#dc-keygen-gen-btn' ).click();

        /* Now send it. */
        $( '#dc-keygen-send-pub-btn' ).click();
    }

    /**
     * @private
     * @desc Switches the key lengths to their correct values.
     */
    static on_exchange_algorithm_changed() {
        /* Variable bit lengths. */
        let dh_bl = discordCrypt.getDHBitSizes(), ecdh_bl = discordCrypt.getECDHBitSizes();

        /* Cache jQuery results. */
        let dc_keygen_method = $( '#dc-keygen-method' ),
            dc_keygen_algorithm = $( '#dc-keygen-algorithm' );

        /* Clear the old select list. */
        $( '#dc-keygen-algorithm option' ).each( ( function () {
            $( this ).remove();
        } ) );

        /* Repopulate the entries. */
        switch ( dc_keygen_method.val() ) {
            case 'dh':
                for ( let i = 0; i < dh_bl.length; i++ ) {
                    let v = dh_bl[ i ];
                    dc_keygen_algorithm.append( new Option( v, v, i === ( dh_bl.length - 1 ) ) );
                }
                break;
            case 'ecdh':
                for ( let i = 0; i < ecdh_bl.length; i++ ) {
                    let v = ecdh_bl[ i ];
                    $( '#dc-keygen-algorithm' ).append( new Option( v, v, i === ( ecdh_bl.length - 1 ) ) );
                }
                break;
            default:
                return;
        }
    }

    /**
     * @private
     * @desc Generates a new key pair using the selected algorithm.
     */
    static on_generate_new_key_pair_button_clicked() {
        let dh_bl = discordCrypt.getDHBitSizes(), ecdh_bl = discordCrypt.getECDHBitSizes();
        let max_salt_len = 32, min_salt_len = 16, salt_len;
        let index, raw_buffer, pub_buffer;
        let key, crypto = require( 'crypto' );

        let dc_keygen_method = $( '#dc-keygen-method' ),
            dc_keygen_algorithm = $( '#dc-keygen-algorithm' );

        /* Get the current algorithm. */
        switch ( dc_keygen_method.val() ) {
            case 'dh':
                /* Generate a new Diffie-Hellman RSA key from the bit size specified. */
                key = discordCrypt.generateDH( parseInt( dc_keygen_algorithm.val() ) );

                /* Calculate the index number starting from 0. */
                index = dh_bl.indexOf( parseInt( dc_keygen_algorithm.val() ) );
                break;
            case 'ecdh':
                /* Generate a new Elliptic-Curve Diffie-Hellman key from the bit size specified. */
                key = discordCrypt.generateECDH( parseInt( dc_keygen_algorithm.val() ) );

                /* Calculate the index number starting from dh_bl.length. */
                index = ( ecdh_bl.indexOf( parseInt( dc_keygen_algorithm.val() ) ) + dh_bl.length );
                break;
            default:
                /* Should never happen. */
                return;
        }

        /* Sanity check. */
        if (
            !key ||
            key === undefined ||
            typeof key.getPrivateKey === 'undefined' ||
            typeof key.getPublicKey === 'undefined'
        )
            return;

        /* Copy the private key to this instance. */
        discordCrypt.privateExchangeKey = key;

        /*****************************************************************************************
         *   [ PUBLIC PAYLOAD STRUCTURE ]
         *   +0x00 - Algorithm + Bit size [ 0-6 = DH ( 768, 1024, 1536, 2048, 3072, 4096, 8192 ) |
         *                                  7-12 = ECDH ( 224, 256, 384, 409, 521, 571 ) ]
         *   +0x01 - Salt length
         *   +0x02 - Salt[ Salt.length ]
         *   +0x02 + Salt.length - Public key
         ****************************************************************************************/

        /* Calculate a random salt length. */
        salt_len = ( parseInt( crypto.randomBytes( 1 ).toString( 'hex' ), 16 ) % ( max_salt_len - min_salt_len ) ) +
            min_salt_len;

        /* Copy the buffer. */
        pub_buffer = Buffer.from(
            key.getPublicKey( 'hex', dc_keygen_method.val() === 'ecdh' ?
                'compressed' :
                undefined
            ),
            'hex'
        );

        /* Create a blank payload. */
        raw_buffer = Buffer.alloc( 2 + salt_len + pub_buffer.length );

        /* Write the algorithm index. */
        raw_buffer.writeInt8( index, 0 );

        /* Write the salt length. */
        raw_buffer.writeInt8( salt_len, 1 );

        /* Generate a random salt and copy it to the buffer. */
        crypto.randomBytes( salt_len ).copy( raw_buffer, 2 );

        /* Copy the public key to the buffer. */
        pub_buffer.copy( raw_buffer, 2 + salt_len );

        /* Get the public key then display it. */
        $( '#dc-pub-key-ta' ).val( raw_buffer.toString( 'hex' ) );

        /* Get the private key then display it. */
        $( '#dc-priv-key-ta' ).val( key.getPrivateKey( 'hex' ) );
    }

    /**
     * @private
     * @desc Clears any public and private keys generated.
     */
    static on_keygen_clear_button_clicked() {
        /* Clear the key textareas. */
        $( '#dc-pub-key-ta' ).val( '' );
        $( '#dc-priv-key-ta' ).val( '' );
    }

    /**
     * @private
     * @desc Sends the currently generate public key in the correct format.
     * @param {discordCrypt} self
     * @returns {Function}
     */
    static on_keygen_send_public_key_button_clicked( /* discordCrypt */ self ) {
        return () => {

            /* Cache jQuery results. */
            let dc_pub_key_ta = $( '#dc-pub-key-ta' );

            /* Don't bother if it's empty. */
            if ( dc_pub_key_ta.val() === '' )
                return;

            /* The text area stores a hex encoded binary. Convert it to a buffer prior to encoding. */
            let message = Buffer.from( dc_pub_key_ta.val(), 'hex' );

            /* Add the header to the message and encode it. */
            message = self.encodedKeyHeader + discordCrypt.substituteMessage( message, true );

            /* Split the message by adding a new line every 32 characters like a standard PGP message. */
            let formatted_message = message.replace( /(.{32})/g, ( e ) => {
                return `${e}\n`
            } );

            /* Calculate the algorithm string. */
            let algo_str = `${$( '#dc-keygen-method' ).val() !== 'ecdh' ? 'DH-' : 'ECDH-'}` +
                `${$( '#dc-keygen-algorithm' ).val()}`;

            /* Construct header & footer elements. */
            let header = `-----BEGIN ${algo_str} PUBLIC KEY-----`,
                footer = `-----END ${algo_str} PUBLIC KEY----- | v${self.getVersion().replace( '-debug', '' )}`;

            /* Send the message. */
            discordCrypt.dispatchMessage(
                self.configFile.useEmbeds,
                formatted_message,
                header,
                footer,
                0x720000,
                '',
                undefined,
                self.cachedModules,
                self.configFile.timedMessages,
                self.configFile.timedMessageExpires
            );

            /* Save the configuration file and store the new message. */
            self.saveConfig();

            /* Update the button text & reset after 1 second.. */
            $( '#dc-keygen-send-pub-btn' ).text( 'Sent The Public Key!' );

            setTimeout( ( function () {
                $( '#dc-keygen-send-pub-btn' ).text( 'Send Public Key' );
            } ), 1000 );
        };
    }

    /**
     * @private
     * @desc Pastes what is stored in the clipboard to the handshake public key field.
     */
    static on_handshake_paste_public_key_button_clicked() {
        $( '#dc-handshake-ppk' ).val( require( 'electron' ).clipboard.readText() );
    }

    /**
     * @private
     * @desc Computes a shared secret and generates passwords based on a DH/ECDH key exchange.
     * @param {discordCrypt} self
     * @returns {Function}
     */
    static on_handshake_compute_button_clicked( /* discordCrypt */ self ) {
        return () => {
            let value, algorithm, payload, salt_len, salt, user_salt_len, user_salt;
            let isUserSaltPrimary;

            /* Cache jQuery results. */
            let dc_pub_key_ta = $( '#dc-pub-key-ta' ),
                dc_priv_key_ta = $( '#dc-priv-key-ta' ),
                dc_handshake_ppk = $( '#dc-handshake-ppk' ),
                dc_handshake_compute_btn = $( '#dc-handshake-compute-btn' );

            /* Provide some way of showing the user the result without actually giving it away. */
            function displaySecret( input_hex ) {
                const charset = discordCrypt.getBraille().splice( 16, 64 );
                let output = '';

                for ( let i = 0; i < parseInt( input_hex.length / 2 ); i++ )
                    output += charset[ parseInt( input_hex.substr( i * 2, 2 ) ) & ( charset.length - 1 ) ];

                return output;
            }

            /* Skip if no public key was entered. */
            if ( !dc_handshake_ppk.val() || !dc_handshake_ppk.val().length )
                return;

            /* Skip if the user hasn't generated a key of their own. */
            if ( !dc_pub_key_ta.val() || !dc_pub_key_ta.val().length ) {
                /* Update the text. */
                dc_handshake_compute_btn.text( 'You Didn\'t Generate A Key!' );
                setTimeout( ( function () {
                    dc_handshake_compute_btn.text( 'Compute Secret Keys' );
                } ), 1000 );
                return;
            }

            /* Check if the message header is valid. */
            if (
                dc_handshake_ppk.val().replace( /\r?\n|\r/g, "" )
                    .slice( 0, 4 ) !== self.encodedKeyHeader
            )
                return;

            /* Snip off the header. */
            let blob = dc_handshake_ppk.val().replace( /\r?\n|\r/g, "" ).slice( 4 );

            /* Skip if invalid braille encoded message. */
            if ( !discordCrypt.isValidBraille( blob ) )
                return;

            try {
                /* Decode the message. */
                value = Buffer.from( discordCrypt.substituteMessage( blob ), 'hex' );
            }
            catch ( e ) {
                /* Update the text. */
                dc_handshake_compute_btn.text( 'Invalid Public Key!' );
                setTimeout( ( function () {
                    dc_handshake_compute_btn.text( 'Compute Secret Keys' );
                } ), 1000 );
                return;
            }

            /* Check the algorithm they're using is the same as ours. */
            algorithm = value.readInt8( 0 );

            /* Check the algorithm is valid. */
            if ( !discordCrypt.isValidExchangeAlgorithm( algorithm ) ) {
                /* Update the text. */
                dc_handshake_compute_btn.text( 'Invalid Algorithm!' );
                setTimeout( ( function () {
                    dc_handshake_compute_btn.text( 'Compute Secret Keys' );
                } ), 1000 );
                return;
            }

            /* Read the user's generated public key. */
            let user_pub_key = Buffer.from( dc_pub_key_ta.val(), 'hex' );

            /* Check the algorithm used is the same as ours. */
            if ( user_pub_key.readInt8( 0 ) !== algorithm ) {
                /* Update the text. */
                dc_handshake_compute_btn.text( 'Mismatched Algorithm!' );
                setTimeout( ( function () {
                    dc_handshake_compute_btn.text( 'Compute Secret Keys' );
                } ), 1000 );
                return;
            }

            /* Update the algorithm text. */
            $( '#dc-handshake-algorithm' ).text(
                `Exchange Algorithm: ${discordCrypt.indexToExchangeAlgorithmString( algorithm )}`
            );

            /* Get the salt length. */
            salt_len = value.readInt8( 1 );

            /* Make sure the salt length is valid. */
            if ( salt_len < 16 || salt_len > 32 ) {
                /* Update the text. */
                dc_handshake_compute_btn.text( 'Invalid Salt Length!' );
                setTimeout( ( function () {
                    dc_handshake_compute_btn.text( 'Compute Secret Keys' );
                } ), 1000 );
                return;
            }

            /* Read the public salt. */
            salt = Buffer.from( value.subarray( 2, 2 + salt_len ) );

            /* Read the user's salt length. */
            user_salt_len = user_pub_key.readInt8( 1 );

            /* Read the user salt. */
            user_salt = Buffer.from( user_pub_key.subarray( 2, 2 + user_salt_len ) );

            /* Update the salt text. */
            $( '#dc-handshake-salts' ).text(
                `Salts: [ ${displaySecret( salt.toString( 'hex' ) )}, ` +
                `${displaySecret( user_salt.toString( 'hex' ) )} ]`
            );

            /* Read the public key and convert it to a hex string. */
            payload = Buffer.from( value.subarray( 2 + salt_len ) ).toString( 'hex' );

            /* Return if invalid. */
            if ( !discordCrypt.privateExchangeKey || discordCrypt.privateExchangeKey === undefined ||
                typeof discordCrypt.privateExchangeKey.computeSecret === 'undefined' ) {
                /* Update the text. */
                dc_handshake_compute_btn.text( 'Failed To Calculate Private Key!' );
                setTimeout( ( function () {
                    dc_handshake_compute_btn.text( 'Compute Secret Keys' );
                } ), 1000 );
                return;
            }

            /* Compute the local secret as a hex string. */
            let derived_secret =
                discordCrypt.computeExchangeSharedSecret( discordCrypt.privateExchangeKey, payload, false, false );

            /* Show error and quit if derivation fails. */
            if ( !derived_secret || !derived_secret.length ) {
                /* Update the text. */
                dc_handshake_compute_btn.text( 'Failed To Derive Key!' );
                setTimeout( ( function () {
                    dc_handshake_compute_btn.text( 'Compute Secret Keys' );
                } ), 1000 );
                return;
            }

            /* Display the first 64 characters of it. */
            $( '#dc-handshake-secret' ).text(
                `Derived Secret: [ ${displaySecret( derived_secret.length > 64 ?
                    derived_secret.substring( 0, 64 ) :
                    derived_secret )
                    } ]`
            );

            /* We have two salts. We can't know which one is our primary salt so just do a simple check on which
             Salt32 is bigger. */
            if ( user_salt_len === salt_len ) {
                for ( let i = 2; i < parseInt( user_salt_len / 4 ); i += 4 ) {
                    let usl = user_salt.readUInt32BE( i ), sl = salt.readUInt32BE( i );

                    if ( usl === sl )
                        continue;

                    isUserSaltPrimary = usl > sl;
                    break;
                }

                /* Salts are equal, should never happen. */
                if ( isUserSaltPrimary === undefined ) {
                    /* Update the text. */
                    dc_handshake_compute_btn.text( 'Both Salts Are Equal ?!' );
                    setTimeout(
                        ( function () {
                            dc_handshake_compute_btn.text( 'Compute Secret Keys' );
                        } ),
                        1000
                    );
                    return;
                }
            }
            else
                isUserSaltPrimary = user_salt_len > salt_len;

            /* Create hashed salt from the two user-generated salts. */
            let primary_hash = Buffer.from(
                discordCrypt.sha512( isUserSaltPrimary ? user_salt : salt, true ),
                'hex'
            );
            let secondary_hash = Buffer.from(
                discordCrypt.whirlpool( isUserSaltPrimary ? salt : user_salt, true ),
                'hex'
            );

            /* Global progress for async callbacks. */
            let primary_progress = 0, secondary_progress = 0;

            /* Calculate the primary key. */
            discordCrypt.scrypt(
                Buffer.from( derived_secret + secondary_hash.toString( 'hex' ), 'hex' ),
                primary_hash,
                256,
                3072,
                16,
                2,
                ( error, progress, key ) => {
                    if ( error ) {
                        /* Update the text. */
                        dc_handshake_compute_btn.text( 'Failed Generating Primary Key!' );
                        setTimeout(
                            ( function () {
                                dc_handshake_compute_btn.text( 'Compute Secret Keys' );
                            } ),
                            1000
                        );
                        return true;
                    }

                    /* Update progress. */
                    if ( progress ) {
                        primary_progress = progress * 50;

                        $( '#dc-exchange-status' )
                            .css( 'width', `${parseInt( primary_progress + secondary_progress )}%` );
                    }

                    if ( key ) {
                        /* Generate a quality report and apply the password. */
                        $( '#dc-handshake-prim-lbl' ).text( `Primary Key: ( Quality - ${
                            discordCrypt.entropicBitLength( key.toString( 'base64' ) )
                            } Bits )` );
                        $( '#dc-handshake-primary-key' ).val( key.toString( 'base64' ) );

                        /* Since more iterations are done for the primary key, this takes 4x as long thus will
                           always finish second. We can thus restore the original Generate text for the button once
                           this is done. */
                        dc_handshake_compute_btn.text( 'Compute Secret Keys' );

                        /* Now we clear the additional information. */
                        $( '#dc-handshake-algorithm' ).text( '...' );
                        $( '#dc-handshake-secret' ).text( '...' );
                        $( '#dc-handshake-salts' ).text( '...' );
                        $( '#dc-exchange-status' ).css( 'width', '0%' );
                    }

                    return false;
                }
            );

            /* Calculate all salts needed. */
            let primary_salt = isUserSaltPrimary ? user_salt : salt;
            let secondary_salt = isUserSaltPrimary ? salt : user_salt;
            let secondary_password = Buffer.from(
                primary_salt.toString( 'hex' ) + derived_secret + secondary_salt.toString( 'hex' ),
                'hex'
            );

            /* Calculate the secondary key. */
            discordCrypt.scrypt( secondary_password, secondary_hash, 256, 3072, 8, 1, ( error, progress, key ) => {
                if ( error ) {
                    /* Update the text. */
                    dc_handshake_compute_btn.text( 'Failed Generating Secondary Key!' );
                    setTimeout(
                        ( function () {
                            dc_handshake_compute_btn.text( 'Compute Secret Keys' );
                        } ),
                        1000
                    );
                    return true;
                }

                if ( progress ) {
                    secondary_progress = progress * 50;
                    $( '#dc-exchange-status' ).css( 'width', `${parseInt( primary_progress + secondary_progress )}%` );
                }

                if ( key ) {
                    /* Generate a quality report and apply the password. */
                    $( '#dc-handshake-sec-lbl' ).text( `Secondary Key: ( Quality - ${
                        discordCrypt.entropicBitLength( key.toString( 'base64' ) )
                        } Bits )` );
                    $( '#dc-handshake-secondary-key' ).val( key.toString( 'base64' ) );
                }

                return false;
            } );

            /* Update the text. */
            dc_handshake_compute_btn.text( 'Generating Keys ...' );

            /* Finally clear all volatile information. */
            discordCrypt.privateExchangeKey = undefined;
            dc_handshake_ppk.val( '' );
            dc_priv_key_ta.val( '' );
            dc_pub_key_ta.val( '' );
        };
    }

    /**
     * @private
     * @desc Copies the currently generated passwords from a key exchange to the clipboard then erases them.
     */
    static on_handshake_copy_keys_button_clicked() {
        /* Cache jQuery results. */
        let dc_handshake_primary_key = $( '#dc-handshake-primary-key' ),
            dc_handshake_secondary_key = $( '#dc-handshake-secondary-key' );

        /* Don't bother if it's empty. */
        if ( dc_handshake_primary_key.val() === '' ||
            dc_handshake_secondary_key.val() === '' )
            return;

        /* Format the text and copy it to the clipboard. */
        require( 'electron' ).clipboard.writeText(
            `Primary Key: ${dc_handshake_primary_key.val()}\r\n\r\n` +
            `Secondary Key: ${dc_handshake_secondary_key.val()}`
        );

        /* Nuke. */
        dc_handshake_primary_key.val( '' );
        dc_handshake_secondary_key.val( '' );

        /* Update the button text & reset after 1 second. */
        $( '#dc-handshake-cpy-keys-btn' ).text( 'Coped Keys To Clipboard!' );

        setTimeout( ( function () {
            $( '#dc-handshake-cpy-keys-btn' ).text( 'Copy Keys & Nuke' );
            $( '#dc-handshake-prim-lbl' ).text( 'Primary Key: ' );
            $( '#dc-handshake-sec-lbl' ).text( 'Secondary Key: ' );
        } ), 1000 );
    }

    /**
     * @private
     * @desc Applies the generate passwords to the current channel or DM.
     * @param {discordCrypt} self
     * @returns {Function}
     */
    static on_handshake_apply_keys_button_clicked( /* discordCrypt */ self ) {
        return () => {

            /* Cache jQuery results. */
            let dc_handshake_primary_key = $( '#dc-handshake-primary-key' ),
                dc_handshake_secondary_key = $( '#dc-handshake-secondary-key' );

            /* Skip if no primary key was generated. */
            if ( !dc_handshake_primary_key.val() || !dc_handshake_primary_key.val().length )
                return;

            /* Skip if no secondary key was generated. */
            if ( !dc_handshake_secondary_key.val() ||
                !dc_handshake_secondary_key.val().length )
                return;

            /* Create the password object and nuke. */
            let pwd = discordCrypt.createPassword(
                dc_handshake_primary_key.val(),
                dc_handshake_secondary_key.val()
            );
            dc_handshake_primary_key.val( '' );
            dc_handshake_secondary_key.val( '' );

            /* Apply the passwords and save the config. */
            self.configFile.passList[ discordCrypt.getChannelId() ] = pwd;
            self.saveConfig();

            /* Update the text and reset it after 1 second. */
            $( '#dc-handshake-apply-keys-btn' ).text( 'Applied & Saved!' );
            setTimeout( ( function () {
                $( '#dc-handshake-apply-keys-btn' ).text( 'Apply Generated Passwords' );

                /* Reset quality bit length fields. */
                $( '#dc-handshake-prim-lbl' ).text( 'Primary Key: ' );
                $( '#dc-handshake-sec-lbl' ).text( 'Secondary Key: ' );

                /* Hide main background. */
                $( '#dc-overlay' ).css( 'display', 'none' );

                /* Hide the entire exchange key menu. */
                $( '#dc-overlay-exchange' ).css( 'display', 'none' );

                /* Reset the index to the info tab. */
                discordCrypt.setActiveExchangeTab( 0 );
            } ), 1000 );
        }
    }

    /**
     * @private
     * @desc Opens the password editor menu.
     */
    static on_passwd_button_clicked() {
        $( '#dc-overlay' ).css( 'display', 'block' );
        $( '#dc-overlay-password' ).css( 'display', 'block' );
    }

    /**
     * @private
     * @desc Saves the entered passwords for the current channel or DM.
     * @param {discordCrypt} self
     * @returns {Function}
     */
    static on_save_passwords_button_clicked( /* discordCrypt */ self ) {
        return () => {
            let btn = $( '#dc-save-pwd' );

            /* Update the password and save it. */
            self.updatePasswords();

            /* Update the text for the button. */
            btn.text( "Saved!" );

            /* Reset the text for the password button after a 1 second delay. */
            setTimeout( ( function () {
                /* Reset text. */
                btn.text( "Save Password" );

                /* Clear the fields. */
                $( "#dc-password-primary" ).val( '' );
                $( "#dc-password-secondary" ).val( '' );

                /* Close. */
                $( '#dc-overlay' ).css( 'display', 'none' );
                $( '#dc-overlay-password' ).css( 'display', 'none' );
            } ), 1000 );
        };
    }

    /**
     * @private
     * @desc Resets passwords for the current channel or DM to their defaults.
     * @param {discordCrypt} self
     * @returns {Function}
     */
    static on_reset_passwords_button_clicked( /* discordCrypt */ self ) {
        return () => {
            let btn = $( '#dc-reset-pwd' );

            /* Reset the configuration for this user and save the file. */
            delete self.configFile.passList[ discordCrypt.getChannelId() ];
            self.saveConfig();

            /* Update the text for the button. */
            btn.text( "Password Reset!" );

            setTimeout( ( function () {
                /* Reset text. */
                btn.text( "Reset Password" );

                /* Clear the fields. */
                $( "#dc-password-primary" ).val( '' );
                $( "#dc-password-secondary" ).val( '' );

                /* Close. */
                $( '#dc-overlay' ).css( 'display', 'none' );
                $( '#dc-overlay-password' ).css( 'display', 'none' );
            } ), 1000 );
        };
    }

    /**
     * @private
     * @desc Closes the password editor menu.
     */
    static on_cancel_password_button_clicked() {
        /* Clear the fields. */
        $( "#dc-password-primary" ).val( '' );
        $( "#dc-password-secondary" ).val( '' );

        /* Close after a .25 second delay. */
        setTimeout( ( function () {
            /* Close. */
            $( '#dc-overlay' ).css( 'display', 'none' );
            $( '#dc-overlay-password' ).css( 'display', 'none' );
        } ), 250 );
    }

    /**
     * @private
     * @desc Copies the passwords from the current channel or DM to the clipboard.
     * @param {discordCrypt} self
     * @returns {Function}
     */
    static on_copy_current_passwords_button_clicked( /* discordCrypt */ self ) {
        return () => {
            let currentKeys = self.configFile.passList[ discordCrypt.getChannelId() ];

            /* If no password is currently generated, write the default key. */
            if ( !currentKeys ) {
                require( 'electron' ).clipboard.writeText( `Default Password: ${self.configFile.defaultPassword}` );
                return;
            }

            /* Write to the clipboard. */
            require( 'electron' ).clipboard.writeText(
                `Primary Key: ${currentKeys.primary}\r\n\r\nSecondary Key: ${currentKeys.secondary}`
            );

            /* Alter the button text. */
            $( '#dc-cpy-pwds-btn' ).text( 'Copied Keys To Clipboard!' );

            /* Reset the button after 1 second close the prompt. */
            setTimeout( ( function () {
                /* Reset. */
                $( '#dc-cpy-pwds-btn' ).text( 'Copy Current Passwords!' );

                /* Close. */
                $( '#dc-cancel-btn' ).click();
            } ), 1000 );
        };
    }

    /**
     * @private
     * @desc Enables or disables automatic message encryption.
     * @param {discordCrypt} self
     * @returns {Function}
     */
    static on_lock_button_clicked( /* discordCrypt */ self ) {
        return () => {

            /* Cache jQuery results. */
            let dc_lock_btn = $( '#dc-lock-btn' );

            /* Update the icon and toggle. */
            if ( !self.configFile.encodeAll ) {
                dc_lock_btn.attr( 'title', 'Disable Message Encryption' );
                dc_lock_btn.html( Buffer.from( self.lockIcon, 'base64' ).toString( 'utf8' ) );
                self.configFile.encodeAll = true;
            }
            else {
                dc_lock_btn.attr( 'title', 'Enable Message Encryption' );
                dc_lock_btn.html( Buffer.from( self.unlockIcon, 'base64' ).toString( 'utf8' ) );
                self.configFile.encodeAll = false;
            }

            /* Set the button class. */
            $( '.dc-svg' ).attr( 'class', 'dc-svg' );

            /* Save config. */
            self.saveConfig();
        };
    }

    /* ================ END UI HANDLE CALLBACKS ================ */

    /* =================== END MAIN CALLBACKS ================== */

    /* =============== BEGIN CRYPTO CALLBACKS ================== */

    /* ======================= UTILITIES ======================= */

    /**
     * @private
     * @desc Checks if the plugin should ignore auto-updates.
     *      Usually in a developer environment, a simple symlink is ( or should be ) used to link the current build
     *      file to the plugin path allowing faster deployment.
     * @param {string} version Version string of the plugin to include in the check.
     * @return {boolean} Returns false if the plugin should auto-update.
     */
    static __shouldIgnoreUpdates( version ) {
        const fs = require( 'fs' );
        const path = require( 'path' );
        const plugin_file = path.join( discordCrypt.getPluginsPath(), discordCrypt.getPluginName() );

        return fs.existsSync( plugin_file ) &&
            ( fs.lstatSync( plugin_file ).isSymbolicLink() || version.indexOf( '-debug' ) !== -1 );
    }

    /**
     * @public
     * @desc Performs an HTTP request returns the result to the callback.
     * @param {string} url The URL of the request.
     * @param {GetResultCallback} callback The callback triggered when the request is complete or an error occurs.
     * @private
     */
    static __getRequest( url, callback ) {
        try {
            require( 'request' )( url, ( error, response, result ) => {
                callback( response.statusCode, response.statusMessage, result );
            } );
        }
        catch ( ex ) {
            callback( -1, ex.toString() );
        }
    }

    /**
     * @private
     * @desc Get React component instance of closest owner of DOM element matched by filter.
     * @author noodlebox
     * @param {Element} element DOM element to start react component searching.
     * @param {object} options Filter to match React component by display name.
     *      If `include` if provided, `exclude` value is ignored.
     * @param {string[]} options.include Array of names to allow.
     * @param {string[]} options.exclude Array of names to ignore.
     * @return {object|null} Closest matched React component instance or null if none is matched.
     */
    static __getElementReactOwner(
        element,
        {
            include,
            exclude = [ "Popout", "Tooltip", "Scroller", "BackgroundFlash" ]
        } = {}
    ) {
        if ( element === undefined )
            return undefined;

        /**
         * Get React Internal Instance mounted to DOM element
         * @author noodlebox
         * @param {Element} e DOM element to get React Internal Instance from
         * @return {object|null} Returns React Internal Instance mounted to this element if exists
         */
        const getOwnerReactInstance = e => e[ Object.keys( e ).find( k => k.startsWith( "__reactInternalInstance" ) ) ];
        const excluding = include === undefined;
        const filter = excluding ? exclude : include;

        function classFilter( owner ) {
            const name = owner.type.displayName || owner.type.name || null;
            return ( name !== null && !!( filter.includes( name ) ^ excluding ) );
        }

        for ( let c = getOwnerReactInstance( element ).return; !_.isNil( c ); c = c.return ) {
            if ( _.isNil( c ) )
                continue;

            if ( !_.isNil( c.stateNode ) && !( c.stateNode instanceof HTMLElement ) && classFilter( c ) )
                return c.stateNode;
        }

        return undefined;
    }

    /**
     * @public
     * @desc Returns the exchange algorithm and bit size for the given metadata as well as a fingerprint.
     * @param {string} key_message The encoded metadata to extract the information from.
     * @param {boolean} header_present Whether the message's magic string is attached to the input.
     * @returns {PublicKeyInfo|null} Returns the algorithm's bit length and name or null.
     * @example
     * __extractKeyInfo( public_key, true );
     * @example
     * __extractKeyInfo( public_key, false );
     */
    static __extractKeyInfo( key_message, header_present = false ) {
        try {
            let output = [];
            let msg = key_message;

            /* Strip the header if necessary. */
            if ( header_present )
                msg = msg.slice( 4 );

            /* Decode the message to hex. */
            msg = discordCrypt.substituteMessage( msg );

            /* Decode the message to raw bytes. */
            msg = Buffer.from( msg, 'hex' );

            /* Sanity check. */
            if ( !discordCrypt.isValidExchangeAlgorithm( msg[ 0 ] ) )
                return null;

            /* Create a fingerprint for the blob. */
            output[ 'fingerprint' ] = discordCrypt.sha256( msg, true );

            /* Buffer[0] contains the algorithm type. Reverse it. */
            output[ 'bit_length' ] = discordCrypt.indexToAlgorithmBitLength( msg[ 0 ] );
            output[ 'algorithm' ] = discordCrypt.indexToExchangeAlgorithmString( msg[ 0 ] )
                .split( '-' )[ 0 ].toLowerCase();

            return output;
        }
        catch ( e ) {
            return null;
        }
    }

    /**
     * @public
     * @desc Splits the input text into chunks according to the specified length.
     * @param {string} input_string The input string.
     * @param {int} max_length The maximum length of the string before splitting.
     * @returns {Array} An array of split strings.
     * @private
     */
    static __splitStringChunks( input_string, max_length ) {
        /* Sanity check. */
        if ( !max_length || max_length < 0 )
            return input_string;

        /* Calculate the maximum number of chunks this can be split into. */
        const num_chunks = Math.ceil( input_string.length / max_length );
        const ret = new Array( num_chunks );

        /* Split each chunk and add it to the output array. */
        for ( let i = 0, offset = 0; i < num_chunks; ++i, offset += max_length )
            ret[ i ] = input_string.substr( offset, max_length );

        return ret;
    }

    /**
     * @public
     * @desc Determines if the given string is a valid username according to Discord's standards.
     * @param {string} name The name of the user and their discriminator.
     * @returns {boolean} Returns true if the username is valid.
     * @example
     * console.log( __isValidUserName( 'Person#1234' ) ); // true
     * @example
     * console.log( __isValidUserName( 'Person#123' ) ); // false
     * @example
     * console.log( __isValidUserName( 'Person#' ) ); // false
     * @example
     * console.log( __isValidUserName( 'Person1234' ) ); // false
     */
    static __isValidUserName( name ) {
        /* Make sure this is actually a string. */
        if ( typeof name !== 'string' )
            return false;

        /* The name must start with the '@' symbol. */
        if ( name[ 0 ] !== '@' )
            return false;

        /* Iterate through the rest of the name and check for the correct format. */
        for ( let i = 1; i < name.length; i++ ) {
            /* Names can't have spaces or '@' symbols. */
            if ( name[ i ] === ' ' || name[ i ] === '@' )
                return false;

            /* Make sure the discriminator is present. */
            if ( i !== 1 && name[ i ] === '#' ) {
                /* The discriminator is 4 characters long. */
                if ( name.length - i - 1 === 4 ) {
                    try {
                        /* Slice off the discriminator. */
                        let n = name.slice( i + 1, i + 5 );
                        /* Do a weak check to ensure that the Base-10 parsed integer is the same as the string. */
                        return !isNaN( n ) && parseInt( n, 10 ) == n;
                    }
                        /* If parsing or slicing somehow fails, this isn't valid. */
                    catch ( e ) {
                        return false;
                    }
                }
            }
        }

        /* No discriminator found means it's invalid. */
        return false;
    }

    /**
     * @public
     * @desc Extracts all tags from the given message and removes any tagged discriminators.
     * @param {string} message The input message to extract all tags from.
     * @returns {UserTags}
     */
    static __extractTags( message ) {
        let split_msg = message.split( ' ' );
        let cleaned_tags = '', cleaned_msg = '';
        let user_tags = [];

        /* Iterate over each segment and check for usernames. */
        for ( let i = 0, k = 0; i < split_msg.length; i++ ) {
            if ( this.__isValidUserName( split_msg[ i ] ) ) {
                user_tags[ k++ ] = split_msg[ i ];
                cleaned_msg += `${split_msg[ i ].split( '#' )[ 0 ]} `;
            }
            /* Check for @here or @everyone. */
            else if ( split_msg[ i ] === '@everyone' || split_msg[ i ] === '@here' ) {
                user_tags[ k++ ] = split_msg[ i ];
                cleaned_msg += `${split_msg[ i ]} `;
            }
            else
                cleaned_msg += `${split_msg[ i ]} `;
        }

        /* Join all tags to a single string. */
        for ( let i = 0; i < user_tags.length; i++ )
            cleaned_tags += `${user_tags[ i ]} `;

        /* Return the parsed message and user tags. */
        return [ cleaned_msg.trim(), cleaned_tags.trim() ];
    }

    /**
     * @public
     * @desc Extracts raw code blocks from a message and returns a descriptive array.
     *      N.B. This does not remove the code blocks from the message.
     * @param {string} message The message to extract all code blocks from.
     * @returns {Array<CodeBlockDescriptor>} Returns an array of CodeBlockDescriptor objects.
     */
    static __extractCodeBlocks( message ) {
        /* This regex only extracts code blocks. */
        let code_block_expr = new RegExp( /^(([ \t]*`{3,4})([^\n]*)([\s\S]+?)(^[ \t]*\2))/gm ),
            inline_block_expr = new RegExp( /(`([^`].*?)`)/g ),
            _matched;

        /* Array to store all the extracted blocks in. */
        let _code_blocks = [];

        /* Loop through each tested RegExp result. */
        while ( ( _matched = code_block_expr.exec( message ) ) ) {
            /* Insert the captured data. */
            _code_blocks.push( {
                start_pos: _matched.index,
                end_pos: _matched.index + _matched[ 1 ].length,
                language: _matched[ 3 ].trim().length === 0 ? 'text' : _matched[ 3 ].trim(),
                raw_code: _matched[ 4 ],
                captured_block: _matched[ 1 ]
            } );
        }

        /* Match inline code blocks. */
        while ( ( _matched = inline_block_expr.exec( message ) ) ) {
            /* Insert the captured data. */
            _code_blocks.push( {
                start_pos: _matched.index,
                end_pos: _matched.index + _matched[ 0 ].length,
                language: 'inline',
                raw_code: message
                    .substr( _matched.index, _matched.index + _matched[ 0 ].length )
                    .split( '`' )[ 1 ],
                captured_block: _matched[ 0 ]
            } );
        }

        return _code_blocks;
    }

    /**
     * @public
     * @desc Extracts raw URLs from a message.
     *      N.B. This does not remove the URLs from the message.
     * @param {string} message The message to extract the URLs from.
     * @returns {Array} Returns an array of URLs detected int the message.
     * @example
     * __extractUrls( 'Hello https://google.com' );
     * //
     * [ 'https://google.com' ]
     */
    static __extractUrls( message ) {
        /* This regex only extracts HTTP/HTTPS/FTP and FILE URLs. */
        let url_expr = new RegExp( /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig ),
            matched;

        /* Array to store all the extracted URLs in. */
        let urls = [];

        /* Loop through each tested RegExp result. */
        while ( ( matched = url_expr.exec( message ) ) ) {
            /* Insert the captured data. */
            urls.push( matched[ 0 ] );
        }

        return urls;
    }

    /**
     * @public
     * @desc Extracts code blocks from a message and formats them in HTML to the proper format.
     * @param {string} message The message to format code blocks from.
     * @returns {CodeBlockInfo} Returns whether the message contains code blocks and the formatted HTML.
     * @example
     * __buildCodeBlockMessage('```\nHello World!\n```');
     * //
     * {
     *      "code": true,
     *      "html": "<div class=\"markup line-scanned\" data-colour=\"true\" style=\"color: rgb(111, 0, 0);\">
     *                  <pre class=\"hljs\">
     *                      <code class=\"dc-code-block hljs\" style=\"position: relative;\">
     *                          <ol><li>Hello World!</li></ol>
     *                      </code>
     *                  </pre>
     *              </div>"
     * }
     */
    static __buildCodeBlockMessage( message ) {
        try {
            /* Extract code blocks. */
            let _extracted = discordCrypt.__extractCodeBlocks( message );

            /* Wrap the message normally. */
            if ( !_extracted.length )
                return {
                    code: false,
                    html: message
                };

            /* Loop over each expanded code block. */
            for ( let i = 0; i < _extracted.length; i++ ) {
                /* Inline code blocks get styled differently. */
                if ( _extracted[ i ].language !== 'inline' ) {
                    let _lines = '';

                    /* Remove any line-reset characters and split the message into lines. */
                    let _code = _extracted[ i ].raw_code.replace( "\r", '' ).split( "\n" );

                    /* Wrap each line in list elements. */
                    /* We start from position 1 since the regex leaves us with 2 blank lines. */
                    for ( let j = 1; j < _code.length - 1; j++ )
                        _lines += `<li>${_code[ j ]}</li>`;

                    /* Split the HTML message according to the full markdown code block. */
                    message = message.split( _extracted[ i ].captured_block );

                    /* Replace the code with an HTML formatted code block. */
                    message = message.join(
                        '<div class="markup line-scanned" data-colour="true" style="color: rgb(111, 0, 0);">' +
                        `<pre class="hljs"><code class="dc-code-block hljs 
                        ${_extracted[ i ].language === 'text' ? '' : _extracted[ i ].language}"
                         style="position: relative;">` +
                        `<ol>${_lines}</ol></code></pre></div>`
                    );
                }
                else {
                    /* Split the HTML message according to the inline markdown code block. */
                    message = message.split( _extracted[ i ].captured_block );

                    /* Replace the data with a inline code class. */
                    message = message.join( `<code class="inline">${_extracted[ i ].raw_code}</code>` );
                }
            }

            /* Return the parsed message. */
            return {
                code: true,
                html: message
            };
        }
        catch ( e ) {
            /* Wrap the message normally. */
            return {
                code: false,
                html: message
            };
        }
    }

    /**
     * @public
     * @desc Extracts URLs from a message and formats them accordingly.
     * @param {string} message The input message to format URLs from.
     * @param {string} [embed_link_prefix] Optional search link prefix for URLs to embed in frames.
     * @returns {URLInfo} Returns whether the message contains URLs and the formatted HTML.
     */
    static __buildUrlMessage( message, embed_link_prefix ) {
        try {
            /* Extract the URLs. */
            let _extracted = discordCrypt.__extractUrls( message );

            /* Wrap the message normally. */
            if ( !_extracted.length )
                return {
                    url: false,
                    html: message
                };

            /* Loop over each URL and format it. */
            for ( let i = 0; i < _extracted.length; i++ ) {
                let join = '';

                /* Split the message according to the URL and replace it. */
                message = message.split( _extracted[ i ] );

                /* If this is an Up1 host, we can directly embed it. Obviously don't embed deletion links.*/
                if (
                    embed_link_prefix !== undefined &&
                    _extracted[ i ].startsWith( `${embed_link_prefix}/#` ) &&
                    _extracted[ i ].indexOf( 'del?ident=' ) === -1
                )
                    join = `<iframe src=${_extracted[ i ]} width="100%" height="400px"></iframe><br/><br/>`;

                /* Join the message together. */
                message = message.join( `${join}<a target="_blank" href="${_extracted[ i ]}">${_extracted[ i ]}</a>` );
            }

            /* Wrap the message in span tags. */
            return {
                url: true,
                html: `<span>${message}</span>`
            };
        }
        catch ( e ) {
            /* Wrap the message normally. */
            return {
                url: false,
                html: message
            };
        }
    }

    /**
     * @public
     * @desc Returns a string, Buffer() or Array() as a buffered object.
     * @param {string|Buffer|Array} input The input variable.
     * @param {boolean|undefined} [is_input_hex] If set to true, the input is parsed as a hex string. If false, it is
     *      parsed as a Base64 string. If this value is undefined, it is parsed as a UTF-8 string.
     * @returns {Buffer} Returns a Buffer object.
     * @throws {string} Thrown an unsupported type error if the input is neither a string, Buffer or Array.
     */
    static __toBuffer( input, is_input_hex = undefined ) {

        /* No conversion needed, return it as-is. */
        if ( Buffer.isBuffer( input ) )
            return input;

        /* If the message is either a Hex, Base64 or UTF-8 encoded string, convert it to a buffer. */
        if ( typeof input === 'string' )
            return Buffer.from( input, is_input_hex === undefined ? 'utf8' : is_input_hex ? 'hex' : 'base64' );

        /* Convert the Array to a Buffer object first. */
        if ( Array.isArray( input ) )
            return Buffer.from( input );

        /* Throw if an invalid type was passed. */
        throw 'Input is neither an Array(), Buffer() or a string.';
    }

    /**
     * @public
     * @desc Creates a hash of the specified algorithm and returns either a hex-encoded or base64-encoded digest.
     * @param {string|Buffer|Array} message The message to perform the hash on.
     * @param {string} algorithm The specified hash algorithm to use.
     * @param {boolean} [to_hex] If true, converts the output to hex else it converts it to Base64.
     * @param {boolean} hmac If this is true, an HMAC hash is created using a secret.
     * @param {string|Buffer|Array} secret The input secret used for the creation of an HMAC object.
     * @returns {string} Returns either a Base64 or hex string on success and an empty string on failure.
     * @example
     * console.log( __createHash( 'Hello World!', 'sha256', true ) );
     * // "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
     * @example
     * console.log( __createHash( 'Hello World', 'sha256', true, true, 'My Secret' ) );
     * // "852f78f917c4408000a8a94be61687865000bec5b2b77c0704dc5ad73ea06368"
     */
    static __createHash( message, algorithm, to_hex, hmac, secret ) {
        try {
            const crypto = require( 'crypto' );

            /* Create the hash algorithm. */
            const hash = hmac ? crypto.createHmac( algorithm, secret ) :
                crypto.createHash( algorithm );

            /* Hash the data. */
            hash.update( message );

            /* Return the digest. */
            return hash.digest( to_hex ? 'hex' : 'base64' );
        }
        catch ( e ) {
            return '';
        }
    }

    /**
     * @public
     * @desc Computes a key-derivation based on the PBKDF2 standard and returns a hex or base64 encoded digest.
     * @param {string|Buffer|Array} input The input value to hash.
     * @param {string|Buffer|Array} salt The secret value used to derive the hash.
     * @param {boolean} [to_hex] Whether to conver the result to a hex string or a Base64 string.
     * @param {boolean} [is_input_hex] Whether to treat the input as a hex or Base64 string.
     *      If undefined, it is interpreted as a UTF-8 string.
     * @param {boolean} [is_salt_hex] Whether to treat the salt as a hex or Base64 string.
     *      If undefined, it is interpreted as a UTF-8 string.
     * @param {PBKDF2Callback} [callback] The callback function if performing an async request.
     * @param {string} algorithm The name of the hash algorithm to use.
     * @param {int} key_length The length of the desired key in bytes.
     * @param {int} iterations The number of recursive iterations to use to produce the resulting hash.
     * @returns {string} If a callback is not specified, this returns the hex or Base64 result or an empty string on
     *      failure.
     * @example
     * __pbkdf2( 'Hello World!', 'Super Secret', true, undefined, undefined, undefined, 'sha256', 32, 10000 );
     * // "89205432badb5b1e53c7bb930d428afd0f98e5702c4e549ea2da4cfefe8af254"
     * @example
     * __pbkdf2( 'ABC', 'Salty!', true, undefined, undefined, ( e, h ) => { console.log( `Hash: ${h}` ); },
     *      'sha256', 32, 1000 );
     * // Hash: f0e110b17b02006bbbcecb8eb295421c69081a6ecda75c94d55d20759dc295b1
     */
    static __pbkdf2( input, salt, to_hex, is_input_hex, is_salt_hex, callback, algorithm, key_length, iterations ) {
        const crypto = require( 'crypto' );
        let _input, _salt;

        /* Convert necessary data to Buffer objects. */
        if ( typeof input === 'object' ) {
            if ( Buffer.isBuffer( input ) )
                _input = input;
            else if ( Array.isArray )
                _input = Buffer.from( input );
            else
                _input = Buffer.from( input, is_input_hex === undefined ? 'utf8' : is_input_hex ? 'hex' : 'base64' );
        }
        else if ( typeof input === 'string' )
            _input = Buffer.from( input, 'utf8' );

        if ( typeof salt === 'object' ) {
            if ( Buffer.isBuffer( salt ) )
                _salt = salt;
            else if ( Array.isArray )
                _salt = Buffer.from( salt );
            else
                _salt = Buffer.from( salt, is_salt_hex === undefined ? 'utf8' : is_salt_hex ? 'hex' : 'base64' );
        }
        else if ( typeof salt === 'string' )
            _salt = Buffer.from( salt, 'utf8' );

        /* For function callbacks, use the async method else use the synchronous method. */
        if ( typeof callback === 'function' )
            crypto.pbkdf2( _input, _salt, iterations, key_length, algorithm, ( e, key ) => {
                callback( e, !e ? key.toString( to_hex ? 'hex' : 'base64' ) : '' );
            } );
        else
            try {
                return crypto.pbkdf2Sync( _input, _salt, iterations, key_length, algorithm )
                    .toString( to_hex ? 'hex' : 'base64' );
            }
            catch ( e ) {
                throw e;
            }
    }

    /**
     * @public
     * @desc Pads or un-pads the input message using the specified encoding format and block size.
     * @param {string|Buffer|Array} message The input message to either pad or unpad.
     * @param {string} padding_scheme The padding scheme used. This can be either: [ ISO1, ISO9, PKC7, ANS2 ]
     * @param {int} block_size The block size that the padding scheme must align the message to.
     * @param {boolean} [is_hex] Whether to treat the message as a hex or Base64 string.
     *      If undefined, it is interpreted as a UTF-8 string.
     * @param {boolean} [remove_padding] Whether to remove the padding applied to the message. If undefined, it is
     *      treated as false.
     * @returns {Buffer} Returns the padded or unpadded message as a Buffer object.
     */
    static __padMessage( message, padding_scheme, block_size, is_hex = undefined, remove_padding = undefined ) {
        let _message, _padBytes;

        /* Returns the number of bytes required to pad a message based on the block size. */
        function __getPaddingLength( totalLength, blockSize ) {
            return totalLength % blockSize === blockSize ? blockSize : blockSize - ( totalLength % blockSize );
        }

        /* Pads a message according to the PKCS #7 / PKCS #5 format. */
        function __PKCS7( message, paddingBytes, remove ) {
            if ( remove === undefined ) {
                /* Allocate required padding length + message length. */
                let padded = Buffer.alloc( message.length + paddingBytes );

                /* Copy the message. */
                message.copy( padded );

                /* Append the number of padding bytes according to PKCS #7 / PKCS #5 format. */
                Buffer.alloc( paddingBytes ).fill( paddingBytes ).copy( padded, message.length );

                /* Return the result. */
                return padded;
            }
            else {
                /* Remove the padding indicated by the last byte. */
                return message.slice( 0, message.length - message.readInt8( message.length - 1 ) );
            }
        }

        /* Pads a message according to the ANSI X9.23 format. */
        function __ANSIX923( message, paddingBytes, remove ) {
            if ( remove === undefined ) {
                /* Allocate required padding length + message length. */
                let padded = Buffer.alloc( message.length + paddingBytes );

                /* Copy the message. */
                message.copy( padded );

                /* Append null-bytes till the end of the message. */
                Buffer.alloc( paddingBytes - 1 ).fill( 0x00 ).copy( padded, message.length );

                /* Append the padding length as the final byte of the message. */
                Buffer.alloc( 1 ).fill( paddingBytes ).copy( padded, message.length + paddingBytes - 1 );

                /* Return the result. */
                return padded;
            }
            else {
                /* Remove the padding indicated by the last byte. */
                return message.slice( 0, message.length - message.readInt8( message.length - 1 ) );
            }
        }

        /* Pads a message according to the ISO 10126 format. */
        function __ISO10126( message, paddingBytes, remove ) {
            const crypto = require( 'crypto' );

            if ( remove === undefined ) {
                /* Allocate required padding length + message length. */
                let padded = Buffer.alloc( message.length + paddingBytes );

                /* Copy the message. */
                message.copy( padded );

                /* Copy random data to the end of the message. */
                crypto.randomBytes( paddingBytes - 1 ).copy( padded, message.length );

                /* Write the padding length at the last byte. */
                padded.writeUInt8( paddingBytes, message.length + paddingBytes - 1 );

                /* Return the result. */
                return padded;
            }
            else {
                /* Remove the padding indicated by the last byte. */
                return message.slice( 0, message.length - message.readUInt8( message.length - 1 ) );
            }
        }

        /* Pads a message according to the ISO 97971 format. */
        function __ISO97971( message, paddingBytes, remove ) {
            if ( remove === undefined ) {
                /* Allocate required padding length + message length. */
                let padded = Buffer.alloc( message.length + paddingBytes );

                /* Copy the message. */
                message.copy( padded );

                /* Append the first byte as 0x80 */
                Buffer.alloc( 1 ).fill( 0x80 ).copy( padded, message.length );

                /* Fill the rest of the padding with zeros. */
                Buffer.alloc( paddingBytes - 1 ).fill( 0x00 ).copy( message, message.length + 1 );

                /* Return the result. */
                return padded;
            }
            else {

                /* Scan backwards. */
                let lastIndex = message.length - 1;

                /* Find the amount of null padding bytes. */
                for ( ; lastIndex > 0; lastIndex-- )
                    /* If a null byte is encountered, split at this index. */
                    if ( message[ lastIndex ] !== 0x00 )
                        break;

                /* Remove the null-padding. */
                let cleaned = message.slice( 0, lastIndex + 1 );

                /* Remove the final byte which is 0x80. */
                return cleaned.slice( 0, cleaned.length - 1 );
            }
        }

        /* Convert the message to a Buffer object. */
        _message = discordCrypt.__toBuffer( message, is_hex );

        /* Get the number of bytes required to pad this message. */
        _padBytes = remove_padding ? 0 : __getPaddingLength( _message.length, block_size / 8 );

        /* Apply the message padding based on the format specified. */
        switch ( padding_scheme.toUpperCase() ) {
            case 'PKC7':
                return __PKCS7( _message, _padBytes, remove_padding );
            case 'ANS2':
                return __ANSIX923( _message, _padBytes, remove_padding );
            case 'ISO1':
                return __ISO10126( _message, _padBytes, remove_padding );
            case 'ISO9':
                return __ISO97971( _message, _padBytes, remove_padding );
            default:
                return '';
        }
    }

    /**
     * @public
     * @desc Determines whether the passed cipher name is valid.
     * @param {string} cipher The name of the cipher to check.
     * @returns {boolean} Returns true if the cipher name is valid.
     * @example
     * console.log( __isValidCipher( 'aes-256-cbc' ) ); // True
     * @example
     * console.log( __isValidCipher( 'aes-256-gcm' ) ); // True
     * @example
     * console.log( __isValidCipher( 'camellia-256-gcm' ) ); // False
     */
    static __isValidCipher( cipher ) {
        const crypto = require( 'crypto' );
        let isValid = false;

        /* Iterate all valid Crypto ciphers and compare the name. */
        let cipher_name = cipher.toLowerCase();
        crypto.getCiphers().every( ( s ) => {
            /* If the cipher matches, stop iterating. */
            if ( s === cipher_name ) {
                isValid = true;
                return false;
            }

            /* Continue iterating. */
            return true;
        } );

        /* Return the result. */
        return isValid;
    }

    /**
     * @public
     * @desc Converts a given key or iv into a buffer object. Performs a hash of the key it doesn't match the blockSize.
     * @param {string|Buffer|Array} key The key to perform validation on.
     * @param {int} key_size_bits The bit length of the desired key.
     * @param {boolean} [use_whirlpool] If the key length is 512-bits, use Whirlpool or SHA-512 hashing.
     * @returns {Buffer} Returns a Buffer() object containing the key of the desired length.
     */
    static __validateKeyIV( key, key_size_bits = 256, use_whirlpool = undefined ) {
        /* Get the designed hashing algorithm. */
        let keyBytes = key_size_bits / 8;

        /* If the length of the key isn't of the desired size, hash it. */
        if ( key.length !== keyBytes ) {
            let hash;

            /* Get the appropriate hash algorithm for the key size. */
            switch ( keyBytes ) {
                case 8:
                    hash = discordCrypt.whirlpool64;
                    break;
                case 16:
                    hash = discordCrypt.sha512_128;
                    break;
                case 20:
                    hash = discordCrypt.sha160;
                    break;
                case 24:
                    hash = discordCrypt.whirlpool192;
                    break;
                case 32:
                    hash = discordCrypt.sha256;
                    break;
                case 64:
                    hash = use_whirlpool !== undefined ? discordCrypt.sha512 : discordCrypt.whirlpool;
                    break;
                default:
                    throw 'Invalid block size specified for key or iv. Only 64, 128, 160, 192, 256 and 512 bit keys' +
                    ' are supported.';
            }
            /* Hash the key and return it as a buffer. */
            return Buffer.from( hash( key, true ), 'hex' );
        }
        else
            return Buffer.from( key );
    }

    /**
     * @public
     * @desc Convert the message to a buffer object.
     * @param {string|Buffer|Array} message The input message.
     * @param {boolean} [is_message_hex] If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @returns {Buffer} Returns a Buffer() object containing the message.
     * @throws An exception indicating the input message type is neither an Array(), Buffer() or string.
     */
    static __validateMessage( message, is_message_hex = undefined ) {
        /* Convert the message to a buffer. */
        try {
            return discordCrypt.__toBuffer( message, is_message_hex );
        }
        catch ( e ) {
            throw 'exception - Invalid message type.';
        }
    }

    /**
     * @public
     * @desc Returns the string encoded mime type of a file based on the file extension.
     * @param {string} file_path The path to the file in question.
     * @returns {string} Returns the known file extension's MIME type or "application/octet-stream".
     */
    static __getFileMimeType( file_path ) {
        /* Look up the Mime type from the file extension. */
        let type = require( 'mime-types' ).lookup( require( 'path' ).extname( file_path ) );

        /* Default to an octet stream if it fails. */
        return type === false ? 'application/octet-stream' : type;
    }

    /**
     * @private
     * @desc Attempts to read the clipboard and converts either Images or text to raw Buffer() objects.
     * @returns {ClipboardInfo} Contains clipboard data. May be null.
     */
    static __clipboardToBuffer() {
        /* Request the clipboard object. */
        let clipboard = require( 'electron' ).clipboard;

        /* Sanity check. */
        if ( !clipboard )
            return { mime_type: '', name: '', data: null };

        /* We use original-fs to bypass any file-restrictions ( Eg. ASAR ) for reading. */
        let fs = require( 'original-fs' ),
            path = require( 'path' );

        /* The clipboard must have at least one type available. */
        if ( clipboard.availableFormats().length === 0 )
            return { mime_type: '', name: '', data: null };

        /* Get all available formats. */
        let mime_type = clipboard.availableFormats();
        let data, tmp = '', name = '', is_file = false;

        /* Loop over each format and try getting the data. */
        for ( let i = 0; i < mime_type.length; i++ ) {
            let format = mime_type[ i ].split( '/' );

            /* For types, prioritize images. */
            switch ( format[ 0 ] ) {
                case 'image':
                    /* Convert the image type. */
                    switch ( format[ 1 ].toLowerCase() ) {
                        case 'png':
                            data = clipboard.readImage().toPNG();
                            break;
                        case 'bmp':
                        case 'bitmap':
                            data = clipboard.readImage().toBitmap();
                            break;
                        case 'jpg':
                        case 'jpeg':
                            data = clipboard.readImage().toJPEG( 100 );
                            break;
                        default:
                            break;
                    }
                    break;
                case 'text':
                    /* Resolve what's in the clipboard. */
                    tmp = clipboard.readText();

                    try {
                        /* Check if this is a valid file path. */
                        let stat = fs.statSync( tmp );

                        /* Check if this is a file. */
                        if ( stat.isFile() ) {
                            /* Read the file and store the file name. */
                            data = fs.readFileSync( tmp );
                            name = path.basename( tmp );
                            is_file = true;
                        }
                        else {
                            /* This isn't a file. Assume we want to upload the path itself as text. */
                            data = Buffer.from( tmp, 'utf8' );
                        }
                    }
                    catch ( e ) {
                        /* Convert the text to a buffer. */
                        data = Buffer.from( tmp, 'utf8' );
                    }
                    break;
                default:
                    break;
            }

            /* Keep trying till it has at least a byte of data to return. */
            if ( data && data.length > 0 ) {
                /* If this is a file, try getting the file's MIME type. */
                if ( is_file )
                    mime_type[ i ] = discordCrypt.__getFileMimeType( tmp );

                /* Return the data. */
                return {
                    mime_type: mime_type[ i ],
                    name: name,
                    data: data
                }
            }
        }

        return { mime_type: '', name: '', data: null };
    }

    /**
     * @public
     * @desc Uploads the specified buffer to Up1's format specifications and returns this data to the callback.
     * @param {Buffer} data The input buffer to encrypt.
     * @param {string} mime_type The MIME type of this file.
     * @param {string} file_name The name of this file.
     * @param {Object} sjcl The loaded Stanford Javascript Crypto Library.
     * @param {EncryptedFileCallback} callback The callback function that will be called on error or completion.
     */
    static __up1EncryptBuffer( data, mime_type, file_name, sjcl, callback ) {
        const crypto = require( 'crypto' );

        /* Returns a parameter object from the input seed. */
        function getParams( /* string|Buffer|Array|Uint8Array */ seed ) {
            /* Convert the seed either from a string to Base64 or read it via raw bytes. */
            if ( typeof seed === 'string' )
                seed = sjcl.codec.base64url.toBits( seed );
            else
                seed = sjcl.codec.bytes.toBits( seed );

            /* Compute an SHA-512 hash. */
            let out = sjcl.hash.sha512.hash( seed );

            /* Calculate the output values based on Up1's specs. */
            return {
                seed: seed,
                key: sjcl.bitArray.bitSlice( out, 0, 256 ),
                iv: sjcl.bitArray.bitSlice( out, 256, 384 ),
                ident: sjcl.bitArray.bitSlice( out, 384, 512 )
            }
        }

        /* Converts a string to its UTF-16 equivalent in network byte order. */
        function str2ab( /* string */ str ) {
            /* UTF-16 requires 2 bytes per UTF-8 byte. */
            let buf = Buffer.alloc( str.length * 2 );

            /* Loop over each byte. */
            for ( let i = 0, strLen = str.length; i < strLen; i++ ) {
                /* Write the UTF-16 equivalent in Big Endian. */
                buf.writeUInt16BE( str.charCodeAt( i ), i * 2 );
            }

            return buf;
        }

        try {
            /* Make sure the file size is less than 50 MB. */
            if ( data.length > 50000000 ) {
                callback( 'Input size must be < 50 MB.' );
                return;
            }

            /* Calculate the upload header and append the file data to it prior to encryption. */
            data = Buffer.concat( [
                str2ab( JSON.stringify( { 'mime': mime_type, 'name': file_name } ) ),
                Buffer.from( [ 0, 0 ] ),
                data
            ] );

            /* Convert the file to a Uint8Array() then to SJCL's bit buffer. */
            data = sjcl.codec.bytes.toBits( new Uint8Array( data ) );

            /* Generate a random 512 bit seed and calculate the key and IV from this. */
            let params = getParams( crypto.randomBytes( 64 ) );

            /* Perform AES-256-CCM encryption on this buffer and return an ArrayBuffer() object. */
            data = sjcl.mode.ccm.encrypt( new sjcl.cipher.aes( params.key ), data, params.iv );

            /* Execute the callback. */
            callback(
                null,
                Buffer.from( sjcl.codec.bytes.fromBits( data ) ),
                sjcl.codec.base64url.fromBits( params.ident ),
                sjcl.codec.base64url.fromBits( params.seed )
            );
        }
        catch ( ex ) {
            callback( ex.toString() );
        }
    }

    /**
     * @private
     * @desc Performs AES-256 CCM encryption of the given file and converts it to the expected Up1 format.
     * @param {string} file_path The path to the file to encrypt.
     * @param {Object} sjcl The loaded SJCL library providing AES-256 CCM.
     * @param {EncryptedFileCallback} callback The callback function for when the file has been encrypted.
     * @param {boolean} [randomize_file_name] Whether to randomize the name of the file in the metadata. Default: False.
     */
    static __up1EncryptFile( file_path, sjcl, callback, randomize_file_name = false ) {
        const crypto = require( 'crypto' );
        const path = require( 'path' );
        const fs = require( 'original-fs' );

        try {
            /* Make sure the file size is less than 50 MB. */
            if ( fs.statSync( file_path ).size > 50000000 ) {
                callback( 'File size must be < 50 MB.' );
                return;
            }

            /* Read the file in an async callback. */
            fs.readFile( file_path, ( error, file_data ) => {
                /* Check for any errors. */
                if ( error !== null ) {
                    callback( error.toString() );
                    return;
                }

                /* Encrypt the file data. */
                discordCrypt.__up1EncryptBuffer(
                    file_data,
                    discordCrypt.__getFileMimeType( file_path ),
                    randomize_file_name ?
                        crypto.pseudoRandomBytes( 8 ).toString( 'hex' ) + path.extname( file_path ) :
                        path.basename( file_path ),
                    sjcl,
                    callback
                )
            } );
        }
        catch ( ex ) {
            callback( ex.toString() );
        }
    }

    /**
     * @public
     * @desc Constructs a "random art" noise based BMP image from the input data.
     * @param {Buffer} data The input data to construct the image from.
     * @param {int} width The width of the image in pixels.
     * @param {int} height The height of the image in pixels.
     * @param {boolean} html_encode Whether to encode the image as a Base64 URI or return a raw buffer.
     * @return {Buffer|string}
     */
    static __constructRandomArtImage( data, width, height, html_encode ) {
        /* Construct a random color array from the input data and use the width + height as a salt. */
        const colors = Buffer.from(
            discordCrypt.pbkdf2_sha160(
                data,
                Buffer.alloc( width + height ).fill( 0 ),
                true,
                undefined,
                undefined,
                width * height * 3,
                1000
            ),
            'hex'
        );

        /* Construct a buffer containing the BMP and DIB file headers. */
        let image = Buffer.concat( [
            /** ----------------------------- **/
            /* BMP File Header Magic. */
            Buffer.from( 'BM' ),
            /* Compressed Size */
            Buffer.from( [ 0, 0, 0, 0 ] ),
            /* Reserved */
            Buffer.from( [ 0, 0 ] ),
            /* Reserved */
            Buffer.from( [ 0, 0 ] ),
            /* Pixel Array Offset */
            Buffer.from( [ 26, 0, 0, 0 ] ),
            /** ----------------------------- **/
            /* DIB v2.0 Header Size */
            Buffer.from( [ 12, 0, 0, 0 ] ),
            /* BMP Width */
            Buffer( [ width, 0 ] ),
            /* BMP Height */
            Buffer( [ height, 0 ] ),
            /* Number Of Color Planes */
            Buffer.from( [ 1, 0 ] ),
            /* Bits Per Pixel */
            Buffer.from( [ 24, 0 ] )
            /** ----------------------------- **/
        ] );

        /* Iterate over each row. */
        for ( let i = 0; i < height; i++ ) {
            /* Add the row's pixels and the padding row if required. */
            image = Buffer.concat( [
                image,
                colors.slice( i * height, ( i * height ) + ( width * 3 ) ),
                Buffer.alloc( width % 4 ).fill( 0 )
            ] );
        }

        /* Add the terminator. */
        image = Buffer.concat( [ image, Buffer.from( [ 0 ] ) ] );

        /* Return the result either encoded or as-is. */
        return html_encode ?
            `data:image/bmp;base64,${image.toString( 'base64' )}` :
            image;
    }

    /**
     * @public
     * @desc Uploads raw data to an Up1 service and returns the file URL and deletion key.
     * @param {string} up1_host The host URL for the Up1 service.
     * @param {string} [up1_api_key] The optional API key used for the service.
     * @param {Object} sjcl The loaded SJCL library providing AES-256 CCM.
     * @param {UploadedFileCallback} callback The callback function called on success or failure.
     * @param {ClipboardInfo} [clipboard_data] Optional clipboard data.
     */
    static __up1UploadClipboard( up1_host, up1_api_key, sjcl, callback, clipboard_data = undefined ) {
        /* Get the current clipboard data. */
        let clipboard = clipboard_data === undefined ? discordCrypt.__clipboardToBuffer() : clipboard_data;

        /* Perform sanity checks on the clipboard data. */
        if ( !clipboard.mime_type.length || clipboard.data === null ) {
            callback( 'Invalid clipboard data.' );
            return;
        }

        /* Get a real file name, whether it be random or actual. */
        let file_name = clipboard.name.length === 0 ?
            require( 'crypto' ).pseudoRandomBytes( 16 ).toString( 'hex' ) :
            clipboard.name;

        /* Encrypt the buffer. */
        this.__up1EncryptBuffer(
            clipboard.data,
            clipboard.mime_type,
            file_name,
            sjcl,
            ( error_string, encrypted_data, identity, encoded_seed ) => {
                /* Return if there's an error. */
                if ( error_string !== null ) {
                    callback( error_string );
                    return;
                }

                /* Create a new FormData() object. */
                let form = new ( require( 'form-data' ) )();

                /* Append the ID and the file data to it. */
                form.append( 'ident', identity );
                form.append( 'file', encrypted_data, { filename: 'file', contentType: 'text/plain' } );

                /* Append the API key if necessary. */
                if ( up1_api_key !== undefined && typeof up1_api_key === 'string' )
                    form.append( 'api_key', up1_api_key );

                /* Perform the post request. */
                require( 'request' ).post( {
                        headers: form.getHeaders(),
                        uri: `${up1_host}/up`,
                        body: form
                    },
                    ( err, res, body ) => {
                        try {
                            /* Execute the callback if no error has occurred. */
                            if ( err !== null )
                                callback( err );
                            else {
                                callback(
                                    null,
                                    `${up1_host}/#${encoded_seed}`,
                                    `${up1_host}/del?ident=${identity}&delkey=${JSON.parse( body ).delkey}`,
                                    encoded_seed
                                );
                            }
                        }
                        catch ( ex ) {
                            callback( ex.toString() );
                        }
                    }
                );
            }
        );
    }

    /**
     * @public
     * @desc Uploads the given file path to an Up1 service and returns the file URL and deletion key.
     * @param {string} file_path The path to the file to encrypt.
     * @param {string} up1_host The host URL for the Up1 service.
     * @param {string} [up1_api_key] The optional API key used for the service.
     * @param {Object} sjcl The loaded SJCL library providing AES-256 CCM.
     * @param {UploadedFileCallback} callback The callback function called on success or failure.
     * @param {boolean} [randomize_file_name] Whether to randomize the name of the file in the metadata. Default: False.
     */
    static __up1UploadFile( file_path, up1_host, up1_api_key, sjcl, callback, randomize_file_name = false ) {
        /* Encrypt the file data first. */
        this.__up1EncryptFile(
            file_path,
            sjcl,
            ( error_string, encrypted_data, identity, encoded_seed ) => {
                /* Return if there's an error. */
                if ( error_string !== null ) {
                    callback( error_string );
                    return;
                }

                /* Create a new FormData() object. */
                let form = new ( require( 'form-data' ) )();

                /* Append the ID and the file data to it. */
                form.append( 'ident', identity );
                form.append( 'file', encrypted_data, { filename: 'file', contentType: 'text/plain' } );

                /* Append the API key if necessary. */
                if ( up1_api_key !== undefined && typeof up1_api_key === 'string' )
                    form.append( 'api_key', up1_api_key );

                /* Perform the post request. */
                require( 'request' ).post( {
                        headers: form.getHeaders(),
                        uri: `${up1_host}/up`,
                        body: form
                    },
                    ( err, res, body ) => {
                        try {
                            /* Execute the callback if no error has occurred. */
                            if ( err !== null )
                                callback( err );
                            else {
                                callback(
                                    null,
                                    `${up1_host}/#${encoded_seed}`,
                                    `${up1_host}/del?ident=${identity}&delkey=${JSON.parse( body ).delkey}`,
                                    encoded_seed
                                );
                            }
                        }
                        catch ( ex ) {
                            callback( ex.toString() );
                        }
                    }
                );
            },
            randomize_file_name
        );
    }

    /* ========================================================= */

    /* ============== NODE CRYPTO HASH PRIMITIVES ============== */

    /**
     * @public
     * @see https://github.com/ricmoo/scrypt-js
     * @desc Performs the Scrypt hash function on the given input.
     * @param {string|Buffer|Array} input The input data to hash.
     * @param {string|Buffer|Array} salt The unique salt used for hashing.
     * @param {int} output_length The desired length of the output in bytes.
     * @param {int} N The work factor variable. Memory and CPU usage scale linearly with this.
     * @param {int} r Increases the size of each hash produced by a factor of 2rK-bits.
     * @param {int} p Parallel factor. Indicates the number of mixing functions to be run simultaneously.
     * @param {ScryptCallback} cb Callback function for progress updates.
     * @returns {boolean} Returns true if successful.
     */
    static scrypt( input, salt, output_length, N = 16384, r = 8, p = 1, cb = null ) {
        let _in, _salt;

        /* PBKDF2-HMAC-SHA256 Helper. */
        function PBKDF2_SHA256( input, salt, size, iterations ) {
            try {
                return Buffer.from(
                    discordCrypt.pbkdf2_sha256( input, salt, true, undefined, undefined, size, iterations ),
                    'hex'
                );
            }
            catch ( e ) {
                discordCrypt.log( e.toString(), 'error' );
                return Buffer.alloc( 1 );
            }
        }

        /**
         * @private
         * @desc Mixes rows and blocks via Salsa20/8..
         * @param {Uint32Array} BY Input/output array.
         * @param {int} Yi Size of r * 32.
         * @param {int} r Block size parameter.
         * @param {Uint32Array} x Salsa20 scratchpad for row mixing.
         * @param {Uint32Array} _X Salsa20 scratchpad for block mixing.
         */
        function Script_RowMix( BY, Yi, r, x, _X ) {
            let i, j, k, l;

            for ( i = 0, j = ( 2 * r - 1 ) * 16; i < 16; i++ )
                _X[ i ] = BY[ j + i ];

            for ( i = 0; i < 2 * r; i++ ) {
                for ( j = 0, k = i * 16; j < 16; j++ )
                    _X[ j ] ^= BY[ k + j ];

                for ( j = 0; j < 16; j++ )
                    x[ j ] = _X[ j ];

                /**
                 * @desc Rotates [a] by [b] bits to the left.
                 * @param {int} a The base value.
                 * @param {int} b The number of bits to rotate [a] to the left by.
                 * @return {number}
                 */
                let R = ( a, b ) => {
                    return ( a << b ) | ( a >>> ( 32 - b ) );
                };

                for ( j = 8; j > 0; j -= 2 ) {
                    x[ 0x04 ] ^= R( x[ 0x00 ] + x[ 0x0C ], 0x07 );
                    x[ 0x08 ] ^= R( x[ 0x04 ] + x[ 0x00 ], 0x09 );
                    x[ 0x0C ] ^= R( x[ 0x08 ] + x[ 0x04 ], 0x0D );
                    x[ 0x00 ] ^= R( x[ 0x0C ] + x[ 0x08 ], 0x12 );
                    x[ 0x09 ] ^= R( x[ 0x05 ] + x[ 0x01 ], 0x07 );
                    x[ 0x0D ] ^= R( x[ 0x09 ] + x[ 0x05 ], 0x09 );
                    x[ 0x01 ] ^= R( x[ 0x0D ] + x[ 0x09 ], 0x0D );
                    x[ 0x05 ] ^= R( x[ 0x01 ] + x[ 0x0D ], 0x12 );
                    x[ 0x0E ] ^= R( x[ 0x0A ] + x[ 0x06 ], 0x07 );
                    x[ 0x02 ] ^= R( x[ 0x0E ] + x[ 0x0A ], 0x09 );
                    x[ 0x06 ] ^= R( x[ 0x02 ] + x[ 0x0E ], 0x0D );
                    x[ 0x0A ] ^= R( x[ 0x06 ] + x[ 0x02 ], 0x12 );
                    x[ 0x03 ] ^= R( x[ 0x0F ] + x[ 0x0B ], 0x07 );
                    x[ 0x07 ] ^= R( x[ 0x03 ] + x[ 0x0F ], 0x09 );
                    x[ 0x0B ] ^= R( x[ 0x07 ] + x[ 0x03 ], 0x0D );
                    x[ 0x0F ] ^= R( x[ 0x0B ] + x[ 0x07 ], 0x12 );
                    x[ 0x01 ] ^= R( x[ 0x00 ] + x[ 0x03 ], 0x07 );
                    x[ 0x02 ] ^= R( x[ 0x01 ] + x[ 0x00 ], 0x09 );
                    x[ 0x03 ] ^= R( x[ 0x02 ] + x[ 0x01 ], 0x0D );
                    x[ 0x00 ] ^= R( x[ 0x03 ] + x[ 0x02 ], 0x12 );
                    x[ 0x06 ] ^= R( x[ 0x05 ] + x[ 0x04 ], 0x07 );
                    x[ 0x07 ] ^= R( x[ 0x06 ] + x[ 0x05 ], 0x09 );
                    x[ 0x04 ] ^= R( x[ 0x07 ] + x[ 0x06 ], 0x0D );
                    x[ 0x05 ] ^= R( x[ 0x04 ] + x[ 0x07 ], 0x12 );
                    x[ 0x0B ] ^= R( x[ 0x0A ] + x[ 0x09 ], 0x07 );
                    x[ 0x08 ] ^= R( x[ 0x0B ] + x[ 0x0A ], 0x09 );
                    x[ 0x09 ] ^= R( x[ 0x08 ] + x[ 0x0B ], 0x0D );
                    x[ 0x0A ] ^= R( x[ 0x09 ] + x[ 0x08 ], 0x12 );
                    x[ 0x0C ] ^= R( x[ 0x0F ] + x[ 0x0E ], 0x07 );
                    x[ 0x0D ] ^= R( x[ 0x0C ] + x[ 0x0F ], 0x09 );
                    x[ 0x0E ] ^= R( x[ 0x0D ] + x[ 0x0C ], 0x0D );
                    x[ 0x0F ] ^= R( x[ 0x0E ] + x[ 0x0D ], 0x12 );
                }

                for ( j = 0; j < 16; ++j )
                    _X[ j ] += x[ j ];

                /* Copy back the result. */
                for ( j = 0, k = Yi + ( i * 16 ); j < 16; j++ )
                    BY[ j + k ] = _X[ j ];
            }

            for ( i = 0; i < r; i++ ) {
                for ( j = 0, k = Yi + ( i * 2 ) * 16, l = ( i * 16 ); j < 16; j++ )
                    BY[ l + j ] = BY[ k + j ];
            }

            for ( i = 0; i < r; i++ ) {
                for ( j = 0, k = Yi + ( i * 2 + 1 ) * 16, l = ( i + r ) * 16; j < 16; j++ )
                    BY[ l + j ] = BY[ k + j ];
            }
        }

        /**
         * @desc Perform the scrypt process in steps and call the callback on intervals.
         * @param {string|Buffer|Array} input The input data to hash.
         * @param {string|Buffer|Array} salt The unique salt used for hashing.
         * @param {int} N The work factor variable. Memory and CPU usage scale linearly with this.
         * @param {int} r Increases the size of each hash produced by a factor of 2rK-bits.
         * @param {int} p Parallel factor. Indicates the number of mixing functions to be run simultaneously.
         * @param {ScryptCallback} cb Callback function for progress updates.
         * @private
         */
        function __perform( input, salt, N, r, p, cb ) {
            let totalOps, currentOps, lastPercentage;
            let b = PBKDF2_SHA256( input, salt, p * 128 * r, 1 );

            let B = new Uint32Array( p * 32 * r );

            let XY = new Uint32Array( 64 * r );
            let V = new Uint32Array( 32 * r * N );

            /* Salsa20 Scratchpad. */
            let x = new Uint32Array( 16 );
            /* Block-mix Salsa20 Scratchpad. */
            let _X = new Uint32Array( 16 );

            /* Initialize the input. */
            for ( let i = 0; i < B.length; i++ ) {
                let j = i * 4;
                B[ i ] =
                    ( ( b[ j + 3 ] & 0xff ) << 24 ) |
                    ( ( b[ j + 2 ] & 0xff ) << 16 ) |
                    ( ( b[ j + 1 ] & 0xff ) << 8 ) |
                    ( ( b[ j ] & 0xff ) << 0 );
            }

            let Yi = 32 * r;

            totalOps = p * N * 2;
            currentOps = 0;
            lastPercentage = null;

            /* Set this to true to abandon the scrypt on the next step. */
            let stop = false;

            /* State information. */
            let state = 0, stateCount = 0, i1;
            let Bi;

            /* How many block-mix salsa8 operations can we do per step? */
            let limit = parseInt( 1000 / r );

            /* Trick from scrypt-async; if there is a setImmediate shim in place, use it. */
            let nextTick = ( typeof( setImmediate ) !== 'undefined' ) ? setImmediate : setTimeout;

            const incrementalSMix = function () {
                if ( stop )
                    return cb( new Error( 'cancelled' ), currentOps / totalOps );

                let steps, i, y, z, currentPercentage;
                switch ( state ) {
                    case 0:
                        Bi = stateCount * 32 * r;
                        /* Row mix #1 */
                        for ( let z = 0; z < Yi; z++ )
                            XY[ z ] = B[ Bi + z ]

                        /* Move to second row mix. */
                        state = 1;
                        i1 = 0;
                    /* Fall through purposely. */
                    case 1:
                        /* Run up to 1000 steps of the first inner S-Mix loop. */
                        steps = N - i1;

                        if ( steps > limit )
                            steps = limit;

                        /* Row mix #2 */
                        for ( i = 0; i < steps; i++ ) {
                            /* Row mix #3 */
                            y = ( i1 + i ) * Yi;
                            z = Yi;
                            while ( z-- ) V[ z + y ] = XY[ z ];

                            /* Row mix #4 */
                            Script_RowMix( XY, Yi, r, x, _X );
                        }

                        i1 += steps;
                        currentOps += steps;

                        /* Call the callback with the progress. ( Optionally stopping us. ) */
                        currentPercentage = parseInt( 1000 * currentOps / totalOps );
                        if ( currentPercentage !== lastPercentage ) {
                            stop = cb( null, currentOps / totalOps );

                            if ( stop )
                                break;

                            lastPercentage = currentPercentage;
                        }

                        if ( i1 < N )
                            break;

                        /* Row mix #6 */
                        i1 = 0;
                        state = 2;
                    /* Fall through purposely. */
                    case 2:

                        /* Run up to 1000 steps of the second inner S-Mix loop. */
                        steps = N - i1;

                        if ( steps > limit )
                            steps = limit;

                        for ( i = 0; i < steps; i++ ) {
                            /* Row mix #8 ( inner ) */
                            for ( z = 0, y = ( XY[ ( 2 * r - 1 ) * 16 ] & ( N - 1 ) ) * Yi; z < Yi; z++ )
                                XY[ z ] ^= V[ y + z ];
                            /* Row mix #9 ( outer ) */
                            Script_RowMix( XY, Yi, r, x, _X );
                        }

                        i1 += steps;
                        currentOps += steps;

                        /* Call the callback with the progress. ( Optionally stopping us. ) */
                        currentPercentage = parseInt( 1000 * currentOps / totalOps );
                        if ( currentPercentage !== lastPercentage ) {
                            stop = cb( null, currentOps / totalOps );

                            if ( stop )
                                break;

                            lastPercentage = currentPercentage;
                        }

                        if ( i1 < N )
                            break;

                        /* Row mix #10 */
                        for ( z = 0; z < Yi; z++ )
                            B[ Bi + z ] = XY[ z ];

                        stateCount++;
                        if ( stateCount < p ) {
                            state = 0;
                            break;
                        }

                        b = [];
                        for ( i = 0; i < B.length; i++ ) {
                            b.push( ( B[ i ] >> 0 ) & 0xff );
                            b.push( ( B[ i ] >> 8 ) & 0xff );
                            b.push( ( B[ i ] >> 16 ) & 0xff );
                            b.push( ( B[ i ] >> 24 ) & 0xff );
                        }

                        /* Done. Don't break to avoid rescheduling. */
                        return cb(
                            null,
                            1.0,
                            Buffer.from( PBKDF2_SHA256( input, Buffer.from( b ), output_length, 1 ) )
                        );
                    default:
                        return cb( new Error( 'invalid state' ), 0 );
                }

                /* Schedule the next steps. */
                nextTick( incrementalSMix );
            };

            incrementalSMix();
        }

        /* Validate input. */
        if ( typeof input === 'object' || typeof input === 'string' ) {
            if ( Array.isArray( input ) )
                _in = Buffer.from( input );
            else if ( Buffer.isBuffer( input ) )
                _in = input;
            else if ( typeof input === 'string' )
                _in = Buffer.from( input, 'utf8' );
            else {
                discordCrypt.log( 'Invalid input parameter type specified!', 'error' );
                return false;
            }
        }

        /* Validate salt. */
        if ( typeof salt === 'object' || typeof salt === 'string' ) {
            if ( Array.isArray( salt ) )
                _salt = Buffer.from( salt );
            else if ( Buffer.isBuffer( salt ) )
                _salt = salt;
            else if ( typeof salt === 'string' )
                _salt = Buffer.from( salt, 'utf8' );
            else {
                discordCrypt.log( 'Invalid salt parameter type specified!', 'error' );
                return false;
            }
        }

        /* Validate derived key length. */
        if ( typeof output_length !== 'number' ) {
            discordCrypt.log( 'Invalid output_length parameter specified. Must be a numeric value.', 'error' );
            return false;
        }
        else if ( output_length <= 0 || output_length >= 65536 ) {
            discordCrypt.log( 'Invalid output_length parameter specified. Must be a numeric value.', 'error' );
            return false;
        }

        /* Validate N is a power of 2. */
        if ( !N || N & ( N - 1 ) !== 0 ) {
            discordCrypt.log( 'Parameter N must be a power of 2.', 'error' );
            return false;
        }

        /* Perform a non-blocking . */
        if ( cb !== undefined && cb !== null ) {
            setTimeout( () => {
                __perform( _in, _salt, N, r, p, cb );
            }, 1 );
            return true;
        }

        /* Signal an error. */
        discordCrypt.log( 'No callback specified.', 'error' );
        return false;
    }

    /**
     * @public
     * @desc Returns the first 64 bits of a Whirlpool digest of the message.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @returns {string} Returns the hex or Base64 encoded result.
     */
    static whirlpool64( message, to_hex ) {
        return Buffer.from( discordCrypt.whirlpool( message, true ), 'hex' )
            .slice( 0, 8 ).toString( to_hex ? 'hex' : 'base64' );
    }

    /**
     * @public
     * @desc Returns the first 128 bits of an SHA-512 digest of a message.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @returns {string} Returns the hex or Base64 encoded result.
     */
    static sha512_128( message, to_hex ) {
        return Buffer.from( discordCrypt.sha512( message, true ), 'hex' )
            .slice( 0, 16 ).toString( to_hex ? 'hex' : 'base64' );
    }

    /**
     * @public
     * @desc Returns the first 192 bits of a Whirlpool digest of the message.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @returns {string} Returns the hex or Base64 encoded result.
     */
    static whirlpool192( message, to_hex ) {
        return Buffer.from( discordCrypt.sha512( message, true ), 'hex' )
            .slice( 0, 24 ).toString( to_hex ? 'hex' : 'base64' );
    }

    /**
     * @public
     * @desc Returns an SHA-160 digest of the message.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @returns {string} Returns the hex or Base64 encoded result.
     */
    static sha160( message, to_hex ) {
        return discordCrypt.__createHash( message, 'sha1', to_hex );
    }

    /**
     * @public
     * @desc Returns an SHA-256 digest of the message.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @returns {string} Returns the hex or Base64 encoded result.
     */
    static sha256( message, to_hex ) {
        return discordCrypt.__createHash( message, 'sha256', to_hex );
    }

    /**
     * @public
     * @desc Returns an SHA-512 digest of the message.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @returns {string} Returns the hex or Base64 encoded result.
     */
    static sha512( message, to_hex ) {
        return discordCrypt.__createHash( message, 'sha512', to_hex );
    }

    /**
     * @public
     * @desc Returns a Whirlpool-512 digest of the message.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @returns {string} Returns the hex or Base64 encoded result.
     */
    static whirlpool( message, to_hex ) {
        return discordCrypt.__createHash( message, 'whirlpool', to_hex );
    }

    /**
     * @public
     * @desc Returns a HMAC-SHA-256 digest of the message.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {Buffer|Array|string} secret The secret input used with the message.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @returns {string} Returns the hex or Base64 encoded result.
     */
    static hmac_sha256( message, secret, to_hex ) {
        return discordCrypt.__createHash( message, 'sha256', to_hex, true, secret );
    }

    /*  */
    /**
     * @public
     * @desc Returns an HMAC-SHA-512 digest of the message.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {Buffer|Array|string} secret The secret input used with the message.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @returns {string} Returns the hex or Base64 encoded result.
     */
    static hmac_sha512( message, secret, to_hex ) {
        return discordCrypt.__createHash( message, 'sha512', to_hex, true, secret );
    }

    /**
     * @public
     * @desc Returns an HMAC-Whirlpool-512 digest of the message.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {Buffer|Array|string} secret The secret input used with the message.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @returns {string} Returns the hex or Base64 encoded result.
     */
    static hmac_whirlpool( message, secret, to_hex ) {
        return discordCrypt.__createHash( message, 'whirlpool', to_hex, true, secret );
    }

    /**
     * @public
     * @desc Computes a derived digest using the PBKDF2 algorithm and SHA-160 as primitives.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {Buffer|Array|string} salt The random salting input used with the message.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @param {boolean} [message_is_hex] Whether to treat the message as a hex or Base64 string.
     *      If undefined, it is interpreted as a UTF-8 string.
     * @param {boolean} [salt_is_hex] Whether to treat the salt as a hex or Base64 string.
     *      If undefined, it is interpreted as a UTF-8 string.
     * @param {int} [key_length] The desired key length size in bytes. Default: 32.
     * @param {int} [iterations] The number of iterations to perform. Default: 5000.
     * @param {HashCallback} [callback] If defined, an async call is made that the result is passed to this when
     *      completed. If undefined, a sync call is made instead.
     * @returns {string|null} If a callback is defined, this returns nothing else it returns either a Base64 or hex
     *      encoded result.
     */
    static pbkdf2_sha160(
        message,
        salt,
        to_hex,
        message_is_hex = undefined,
        salt_is_hex = undefined,
        key_length = 32,
        iterations = 5000,
        callback = undefined
    ) {
        return discordCrypt.__pbkdf2(
            message,
            salt,
            to_hex,
            message_is_hex,
            salt_is_hex,
            callback,
            'sha1',
            key_length,
            iterations
        );
    }

    /**
     * @public
     * @desc Computes a derived digest using the PBKDF2 algorithm and SHA-256 as primitives.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {Buffer|Array|string} salt The random salting input used with the message.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @param {boolean} [message_is_hex] Whether to treat the message as a hex or Base64 string.
     *      If undefined, it is interpreted as a UTF-8 string.
     * @param {boolean} [salt_is_hex] Whether to treat the salt as a hex or Base64 string.
     *      If undefined, it is interpreted as a UTF-8 string.
     * @param {int} [key_length] The desired key length size in bytes. Default: 32.
     * @param {int} [iterations] The number of iterations to perform. Default: 5000.
     * @param {HashCallback} [callback] If defined, an async call is made that the result is passed to this when
     *      completed. If undefined, a sync call is made instead.
     * @returns {string|null} If a callback is defined, this returns nothing else it returns either a Base64 or hex
     *      encoded result.
     */
    static pbkdf2_sha256(
        message,
        salt,
        to_hex,
        message_is_hex = undefined,
        salt_is_hex = undefined,
        key_length = 32,
        iterations = 5000,
        callback = undefined
    ) {
        return discordCrypt.__pbkdf2(
            message,
            salt,
            to_hex,
            message_is_hex,
            salt_is_hex,
            callback,
            'sha256',
            key_length,
            iterations
        );
    }

    /**
     * @public
     * @desc Computes a derived digest using the PBKDF2 algorithm and SHA-512 as primitives.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {Buffer|Array|string} salt The random salting input used with the message.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @param {boolean} [message_is_hex] Whether to treat the message as a hex or Base64 string.
     *      If undefined, it is interpreted as a UTF-8 string.
     * @param {boolean} [salt_is_hex] Whether to treat the salt as a hex or Base64 string.
     *      If undefined, it is interpreted as a UTF-8 string.
     * @param {int} [key_length] The desired key length size in bytes. Default: 32.
     * @param {int} [iterations] The number of iterations to perform. Default: 5000.
     * @param {HashCallback} [callback] If defined, an async call is made that the result is passed to this when
     *      completed. If undefined, a sync call is made instead.
     * @returns {string|null} If a callback is defined, this returns nothing else it returns either a Base64 or hex
     *      encoded result.
     */
    static pbkdf2_sha512(
        /* Buffer|Array|string */   message,
        /* Buffer|Array|string */   salt,
        /* boolean */               to_hex,
        /* boolean */               message_is_hex = undefined,
        /* boolean */               salt_is_hex = undefined,
        /* int */                   key_length = 32,
        /* int */                   iterations = 5000,
        /* function(err, hash) */   callback = undefined
    ) {
        return discordCrypt.__pbkdf2(
            message,
            salt,
            to_hex,
            message_is_hex,
            salt_is_hex,
            callback,
            'sha512',
            key_length,
            iterations
        );
    }

    /**
     * @public
     * @desc Computes a derived digest using the PBKDF2 algorithm and Whirlpool-512 as primitives.
     * @param {Buffer|Array|string} message The input message to hash.
     * @param {Buffer|Array|string} salt The random salting input used with the message.
     * @param {boolean} to_hex Whether to convert the result to hex or Base64.
     * @param {boolean} [message_is_hex] Whether to treat the message as a hex or Base64 string.
     *      If undefined, it is interpreted as a UTF-8 string.
     * @param {boolean} [salt_is_hex] Whether to treat the salt as a hex or Base64 string.
     *      If undefined, it is interpreted as a UTF-8 string.
     * @param {int} [key_length] The desired key length size in bytes. Default: 32.
     * @param {int} [iterations] The number of iterations to perform. Default: 5000.
     * @param {HashCallback} [callback] If defined, an async call is made that the result is passed to this when
     *      completed. If undefined, a sync call is made instead.
     * @returns {string|null} If a callback is defined, this returns nothing else it returns either a Base64 or hex
     *      encoded result.
     */
    static pbkdf2_whirlpool(
        message,
        salt,
        to_hex,
        message_is_hex = undefined,
        salt_is_hex = undefined,
        key_length = 32,
        iterations = 5000,
        callback = undefined
    ) {
        return discordCrypt.__pbkdf2(
            message,
            salt,
            to_hex,
            message_is_hex,
            salt_is_hex,
            callback,
            'whirlpool',
            key_length,
            iterations
        );
    }

    /* ============ END NODE CRYPTO HASH PRIMITIVES ============ */

    /* ================ CRYPTO CIPHER FUNCTIONS ================ */

    /**
     * @public
     * @desc Encrypts the given plain-text message using the algorithm specified.
     * @param {string} symmetric_cipher The name of the symmetric cipher used to encrypt the message.
     *      This must be supported by NodeJS's crypto module.
     * @param {string} block_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_scheme The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {string|Buffer|Array} message The input message to encrypt.
     * @param {string|Buffer|Array} key The key used with the encryption cipher.
     * @param {boolean} convert_to_hex If true, the ciphertext is converted to a hex string, if false, it is
     *      converted to a Base64 string.
     * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {int} [key_size_bits] The size of the input key required for the chosen cipher. Defaults to 256 bits.
     * @param {int} [block_cipher_size] The size block cipher in bits. Defaults to 128 bits.
     * @param {string|Buffer|Array} [one_time_salt] If specified, contains the 64-bit salt used to derive an IV and
     *      Key used to encrypt the message.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {Buffer|null} Returns a Buffer() object containing the ciphertext or null if the chosen options are
     *      invalid.
     * @throws Exception indicating the error that occurred.
     */
    static __encrypt(
        symmetric_cipher,
        block_mode,
        padding_scheme,
        message,
        key,
        convert_to_hex,
        is_message_hex,
        key_size_bits = 256,
        block_cipher_size = 128,
        one_time_salt = undefined,
        kdf_iteration_rounds = 1000
    ) {
        const cipher_name = `${symmetric_cipher}${block_mode === undefined ? '' : '-' + block_mode}`;
        const crypto = require( 'crypto' );

        /* Buffered parameters. */
        let _message, _key, _iv, _salt, _derived, _encrypt;

        /* Make sure the cipher name and mode is valid first. */
        if (
            !discordCrypt.__isValidCipher( cipher_name ) || [ 'cbc', 'cfb', 'ofb' ]
                .indexOf( block_mode.toLowerCase() ) === -1
        )
            return null;

        /* Pad the message to the nearest block boundary. */
        _message = discordCrypt.__padMessage( message, padding_scheme, key_size_bits, is_message_hex );

        /* Get the key as a buffer. */
        _key = discordCrypt.__validateKeyIV( key, key_size_bits );

        /* Check if using a predefined salt. */
        if ( one_time_salt !== undefined ) {
            /* Convert the salt to a Buffer. */
            _salt = discordCrypt.__toBuffer( one_time_salt );

            /* Don't bother continuing if conversions have failed. */
            if ( !_salt || _salt.length === 0 )
                return null;

            /* Only 64 bits is used for a salt. If it's not that length, hash it and use the result. */
            if ( _salt.length !== 8 )
                _salt = Buffer.from( discordCrypt.whirlpool64( _salt, true ), 'hex' );
        }
        else {
            /* Generate a random salt to derive the key and IV. */
            _salt = crypto.randomBytes( 8 );
        }

        /* Derive the key length and IV length. */
        _derived = discordCrypt.pbkdf2_sha256( _key.toString( 'hex' ), _salt.toString( 'hex' ), true, true, true,
            ( block_cipher_size / 8 ) + ( key_size_bits / 8 ), kdf_iteration_rounds );

        /* Slice off the IV. */
        _iv = _derived.slice( 0, block_cipher_size / 8 );

        /* Slice off the key. */
        _key = _derived.slice( block_cipher_size / 8, ( block_cipher_size / 8 ) + ( key_size_bits / 8 ) );

        /* Create the cipher with derived IV and key. */
        _encrypt = crypto.createCipheriv( cipher_name, _key, _iv );

        /* Disable automatic PKCS #7 padding. We do this in-house. */
        _encrypt.setAutoPadding( false );

        /* Get the cipher text. */
        let _ct = _encrypt.update( _message, undefined, 'hex' );
        _ct += _encrypt.final( 'hex' );

        /* Return the result with the prepended salt. */
        return Buffer.from( _salt.toString( 'hex' ) + _ct, 'hex' ).toString( convert_to_hex ? 'hex' : 'base64' );
    }

    /**
     * @public
     * @desc Decrypts the given cipher-text message using the algorithm specified.
     * @param {string} symmetric_cipher The name of the symmetric cipher used to decrypt the message.
     *      This must be supported by NodeJS's crypto module.
     * @param {string} block_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_scheme The padding scheme used to unpad the message from the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {string|Buffer|Array} message The input ciphertext message to decrypt.
     * @param {string|Buffer|Array} key The key used with the decryption cipher.
     * @param {boolean} output_format The output format of the plaintext.
     *      Can be either [ 'utf8', 'latin1', 'hex', 'base64' ]
     * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {int} [key_size_bits] The size of the input key required for the chosen cipher. Defaults to 256 bits.
     * @param {int} [block_cipher_size] The size block cipher in bits. Defaults to 128 bits.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {string|null} Returns a string of the desired format containing the plaintext or null if the chosen
     * options are invalid.
     * @throws Exception indicating the error that occurred.
     */
    static __decrypt(
        symmetric_cipher,
        block_mode,
        padding_scheme,
        message,
        key,
        output_format,
        is_message_hex,
        key_size_bits = 256,
        block_cipher_size = 128,
        kdf_iteration_rounds = 1000
    ) {
        const cipher_name = `${symmetric_cipher}${block_mode === undefined ? '' : '-' + block_mode}`;
        const crypto = require( 'crypto' );

        /* Buffered parameters. */
        let _message, _key, _iv, _salt, _derived, _decrypt;

        /* Make sure the cipher name and mode is valid first. */
        if ( !discordCrypt.__isValidCipher( cipher_name ) || [ 'cbc', 'ofb', 'cfb' ]
            .indexOf( block_mode.toLowerCase() ) === -1 )
            return null;

        /* Get the message as a buffer. */
        _message = discordCrypt.__validateMessage( message, is_message_hex );

        /* Get the key as a buffer. */
        _key = discordCrypt.__validateKeyIV( key, key_size_bits );

        /* Retrieve the 64-bit salt. */
        _salt = _message.slice( 0, 8 );

        /* Derive the key length and IV length. */
        _derived = discordCrypt.pbkdf2_sha256( _key.toString( 'hex' ), _salt.toString( 'hex' ), true, true, true,
            ( block_cipher_size / 8 ) + ( key_size_bits / 8 ), kdf_iteration_rounds );

        /* Slice off the IV. */
        _iv = _derived.slice( 0, block_cipher_size / 8 );

        /* Slice off the key. */
        _key = _derived.slice( block_cipher_size / 8, ( block_cipher_size / 8 ) + ( key_size_bits / 8 ) );

        /* Splice the message. */
        _message = _message.slice( 8 );

        /* Create the cipher with IV. */
        _decrypt = crypto.createDecipheriv( cipher_name, _key, _iv );

        /* Disable automatic PKCS #7 padding. We do this in-house. */
        _decrypt.setAutoPadding( false );

        /* Decrypt the cipher text. */
        let _pt = _decrypt.update( _message, undefined, 'hex' );
        _pt += _decrypt.final( 'hex' );

        /* Unpad the message. */
        _pt = discordCrypt.__padMessage( _pt, padding_scheme, key_size_bits, true, true );

        /* Return the buffer. */
        return _pt.toString( output_format );
    }


    /**
     * @public
     * @desc Blowfish encrypts a message.
     * @param {string|Buffer|Array} message The input message to encrypt.
     * @param {string|Buffer|Array} key The key used with the encryption cipher.
     * @param {string} cipher_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {boolean} to_hex If true, the ciphertext is converted to a hex string, if false, it is
     *      converted to a Base64 string.
     * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {string|Buffer|Array} [one_time_salt] If specified, contains the 64-bit salt used to derive an IV and
     *      Key used to encrypt the message.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {Buffer} Returns a Buffer() object containing the resulting ciphertext.
     * @throws An exception indicating the error that occurred.
     */
    static blowfish512_encrypt(
        message,
        key,
        cipher_mode,
        padding_mode,
        to_hex = false,
        is_message_hex = undefined,
        one_time_salt = undefined,
        kdf_iteration_rounds = 1000
    ) {
        /* Size constants for Blowfish. */
        const keySize = 512, blockSize = 64;

        /* Perform the encryption. */
        return discordCrypt.__encrypt(
            'bf',
            cipher_mode,
            padding_mode,
            message,
            key,
            to_hex,
            is_message_hex,
            keySize,
            blockSize,
            one_time_salt,
            kdf_iteration_rounds
        );
    }

    /**
     * @public
     * @desc Blowfish decrypts a message.
     * @param {string|Buffer|Array} message The input message to decrypt.
     * @param {string|Buffer|Array} key The key used with the decryption cipher.
     * @param {string} cipher_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {string} output_format The output format of the decrypted message.
     *      This can be either: [ 'hex', 'base64', 'latin1', 'utf8' ].
     * @param {boolean} [is_message_hex] If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {string|null} Returns a string of the desired format containing the plaintext or null if the chosen
     *      options are invalid.
     * @throws Exception indicating the error that occurred.
     */
    static blowfish512_decrypt(
        message,
        key,
        cipher_mode,
        padding_mode,
        output_format = 'utf8',
        is_message_hex = undefined,
        kdf_iteration_rounds = 1000
    ) {
        /* Size constants for Blowfish. */
        const keySize = 512, blockSize = 64;

        /* Return the unpadded message. */
        return discordCrypt.__decrypt(
            'bf',
            cipher_mode,
            padding_mode,
            message,
            key,
            output_format,
            is_message_hex,
            keySize,
            blockSize,
            kdf_iteration_rounds
        );
    }

    /**
     * @public
     * @desc AES-256 encrypts a message.
     * @param {string|Buffer|Array} message The input message to encrypt.
     * @param {string|Buffer|Array} key The key used with the encryption cipher.
     * @param {string} cipher_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {boolean} to_hex If true, the ciphertext is converted to a hex string, if false, it is
     *      converted to a Base64 string.
     * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {string|Buffer|Array} [one_time_salt] If specified, contains the 64-bit salt used to derive an IV and
     *      Key used to encrypt the message.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {Buffer} Returns a Buffer() object containing the resulting ciphertext.
     * @throws An exception indicating the error that occurred.
     */
    static aes256_encrypt(
        message,
        key,
        cipher_mode,
        padding_mode,
        to_hex = false,
        is_message_hex = undefined,
        one_time_salt = undefined,
        kdf_iteration_rounds = 1000
    ) {
        /* Size constants for AES-256. */
        const keySize = 256, blockSize = 128;

        /* Perform the encryption. */
        return discordCrypt.__encrypt(
            'aes-256',
            cipher_mode,
            padding_mode,
            message,
            key,
            to_hex,
            is_message_hex,
            keySize,
            blockSize,
            one_time_salt,
            kdf_iteration_rounds
        );
    }

    /**
     * @public
     * @desc AES-256 decrypts a message.
     * @param {string|Buffer|Array} message The input message to decrypt.
     * @param {string|Buffer|Array} key The key used with the decryption cipher.
     * @param {string} cipher_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {string} output_format The output format of the decrypted message.
     *      This can be either: [ 'hex', 'base64', 'latin1', 'utf8' ].
     * @param {boolean} [is_message_hex] If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {string|null} Returns a string of the desired format containing the plaintext or null if the chosen
     *      options are invalid.
     * @throws Exception indicating the error that occurred.
     */
    static aes256_decrypt(
        message,
        key,
        cipher_mode,
        padding_mode,
        output_format = 'utf8',
        is_message_hex = undefined,
        kdf_iteration_rounds = 1000
    ) {
        /* Size constants for AES-256. */
        const keySize = 256, blockSize = 128;

        /* Return the unpadded message. */
        return discordCrypt.__decrypt(
            'aes-256',
            cipher_mode,
            padding_mode,
            message,
            key,
            output_format,
            is_message_hex,
            keySize,
            blockSize,
            kdf_iteration_rounds
        );
    }

    /*  */
    /**
     * @public
     * @desc AES-256 decrypts a message in GCM mode.
     * @param {string|Buffer|Array} message The input message to encrypt.
     * @param {string|Buffer|Array} key The key used with the encryption cipher.
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {boolean} to_hex If true, the ciphertext is converted to a hex string, if false, it is
     *      converted to a Base64 string.
     * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {string|Buffer|Array} [additional_data] If specified, this additional data is used during GCM
     *      authentication.
     * @param {string|Buffer|Array} [one_time_salt] If specified, contains the 64-bit salt used to derive an IV and
     *      Key used to encrypt the message.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {Buffer} Returns a Buffer() object containing the resulting ciphertext.
     * @throws An exception indicating the error that occurred.
     */
    static aes256_encrypt_gcm(
        message,
        key,
        padding_mode,
        to_hex = false,
        is_message_hex = undefined,
        additional_data = undefined,
        one_time_salt = undefined,
        kdf_iteration_rounds = 1000
    ) {
        const block_cipher_size = 128, key_size_bits = 256;
        const cipher_name = 'aes-256-gcm';
        const crypto = require( 'crypto' );

        let _message, _key, _iv, _salt, _derived, _encrypt;

        /* Pad the message to the nearest block boundary. */
        _message = discordCrypt.__padMessage( message, padding_mode, key_size_bits, is_message_hex );

        /* Get the key as a buffer. */
        _key = discordCrypt.__validateKeyIV( key, key_size_bits );

        /* Check if using a predefined salt. */
        if ( one_time_salt !== undefined ) {
            /* Convert the salt to a Buffer. */
            _salt = discordCrypt.__toBuffer( one_time_salt );

            /* Don't bother continuing if conversions have failed. */
            if ( !_salt || _salt.length === 0 )
                return null;

            /* Only 64 bits is used for a salt. If it's not that length, hash it and use the result. */
            if ( _salt.length !== 8 )
                _salt = Buffer.from( discordCrypt.whirlpool64( _salt, true ), 'hex' );
        }
        else {
            /* Generate a random salt to derive the key and IV. */
            _salt = crypto.randomBytes( 8 );
        }

        /* Derive the key length and IV length. */
        _derived = discordCrypt.pbkdf2_sha256( _key.toString( 'hex' ), _salt.toString( 'hex' ), true, true, true,
            ( block_cipher_size / 8 ) + ( key_size_bits / 8 ), kdf_iteration_rounds );

        /* Slice off the IV. */
        _iv = _derived.slice( 0, block_cipher_size / 8 );

        /* Slice off the key. */
        _key = _derived.slice( block_cipher_size / 8, ( block_cipher_size / 8 ) + ( key_size_bits / 8 ) );

        /* Create the cipher with derived IV and key. */
        _encrypt = crypto.createCipheriv( cipher_name, _key, _iv );

        /* Add the additional data if necessary. */
        if ( additional_data !== undefined )
            _encrypt.setAAD( discordCrypt.__toBuffer( additional_data ) );

        /* Disable automatic PKCS #7 padding. We do this in-house. */
        _encrypt.setAutoPadding( false );

        /* Get the cipher text. */
        let _ct = _encrypt.update( _message, undefined, 'hex' );
        _ct += _encrypt.final( 'hex' );

        /* Return the auth tag prepended with the salt to the message. */
        return Buffer.from(
            _encrypt.getAuthTag().toString( 'hex' ) + _salt.toString( 'hex' ) + _ct,
            'hex'
        ).toString( to_hex ? 'hex' : 'base64' );
    }

    /**
     * @public
     * @desc AES-256 decrypts a message in GCM mode.
     * @param {string|Buffer|Array} message The input message to decrypt.
     * @param {string|Buffer|Array} key The key used with the decryption cipher.
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {string} output_format The output format of the decrypted message.
     *      This can be either: [ 'hex', 'base64', 'latin1', 'utf8' ].
     * @param {boolean} [is_message_hex] If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {string|Buffer|Array} [additional_data] If specified, this additional data is used during GCM
     *      authentication.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {string|null} Returns a string of the desired format containing the plaintext or null if the chosen
     *      options are invalid.
     * @throws Exception indicating the error that occurred.
     */
    static aes256_decrypt_gcm(
        message,
        key,
        padding_mode,
        output_format = 'utf8',
        is_message_hex = undefined,
        additional_data = undefined,
        kdf_iteration_rounds = 1000
    ) {
        const block_cipher_size = 128, key_size_bits = 256;
        const cipher_name = 'aes-256-gcm';
        const crypto = require( 'crypto' );

        /* Buffered parameters. */
        let _message, _key, _iv, _salt, _authTag, _derived, _decrypt;

        /* Get the message as a buffer. */
        _message = discordCrypt.__validateMessage( message, is_message_hex );

        /* Get the key as a buffer. */
        _key = discordCrypt.__validateKeyIV( key, key_size_bits );

        /* Retrieve the auth tag. */
        _authTag = _message.slice( 0, block_cipher_size / 8 );

        /* Splice the message. */
        _message = _message.slice( block_cipher_size / 8 );

        /* Retrieve the 64-bit salt. */
        _salt = _message.slice( 0, 8 );

        /* Splice the message. */
        _message = _message.slice( 8 );

        /* Derive the key length and IV length. */
        _derived = discordCrypt.pbkdf2_sha256( _key.toString( 'hex' ), _salt.toString( 'hex' ), true, true, true,
            ( block_cipher_size / 8 ) + ( key_size_bits / 8 ), kdf_iteration_rounds );

        /* Slice off the IV. */
        _iv = _derived.slice( 0, block_cipher_size / 8 );

        /* Slice off the key. */
        _key = _derived.slice( block_cipher_size / 8, ( block_cipher_size / 8 ) + ( key_size_bits / 8 ) );

        /* Create the cipher with IV. */
        _decrypt = crypto.createDecipheriv( cipher_name, _key, _iv );

        /* Set the authentication tag. */
        _decrypt.setAuthTag( _authTag );

        /* Set the additional data for verification if necessary. */
        if ( additional_data !== undefined )
            _decrypt.setAAD( discordCrypt.__toBuffer( additional_data ) );

        /* Disable automatic PKCS #7 padding. We do this in-house. */
        _decrypt.setAutoPadding( false );

        /* Decrypt the cipher text. */
        let _pt = _decrypt.update( _message, undefined, 'hex' );
        _pt += _decrypt.final( 'hex' );

        /* Unpad the message. */
        _pt = discordCrypt.__padMessage( _pt, padding_mode, key_size_bits, true, true );

        /* Return the buffer. */
        return _pt.toString( output_format );
    }

    /**
     * @public
     * @desc Camellia-256 encrypts a message.
     * @param {string|Buffer|Array} message The input message to encrypt.
     * @param {string|Buffer|Array} key The key used with the encryption cipher.
     * @param {string} cipher_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {boolean} to_hex If true, the ciphertext is converted to a hex string, if false, it is
     *      converted to a Base64 string.
     * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {string|Buffer|Array} [one_time_salt] If specified, contains the 64-bit salt used to derive an IV and
     *      Key used to encrypt the message.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {Buffer} Returns a Buffer() object containing the resulting ciphertext.
     * @throws An exception indicating the error that occurred.
     */
    static camellia256_encrypt(
        message,
        key,
        cipher_mode,
        padding_mode,
        to_hex = false,
        is_message_hex = undefined,
        one_time_salt = undefined,
        kdf_iteration_rounds = 1000
    ) {
        /* Size constants for Camellia-256. */
        const keySize = 256, blockSize = 128;

        /* Perform the encryption. */
        return discordCrypt.__encrypt(
            'camellia-256',
            cipher_mode,
            padding_mode,
            message,
            key,
            to_hex,
            is_message_hex,
            keySize,
            blockSize,
            one_time_salt,
            kdf_iteration_rounds
        );
    }

    /**
     * @public
     * @desc Camellia-256 decrypts a message.
     * @param {string|Buffer|Array} message The input message to decrypt.
     * @param {string|Buffer|Array} key The key used with the decryption cipher.
     * @param {string} cipher_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {string} output_format The output format of the decrypted message.
     *      This can be either: [ 'hex', 'base64', 'latin1', 'utf8' ].
     * @param {boolean} [is_message_hex] If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {string|null} Returns a string of the desired format containing the plaintext or null if the chosen
     *      options are invalid.
     * @throws Exception indicating the error that occurred.
     */
    static camellia256_decrypt(
        message,
        key,
        cipher_mode,
        padding_mode,
        output_format = 'utf8',
        is_message_hex = undefined,
        kdf_iteration_rounds = 1000
    ) {
        /* Size constants for Camellia-256. */
        const keySize = 256, blockSize = 128;

        /* Return the unpadded message. */
        return discordCrypt.__decrypt(
            'camellia-256',
            cipher_mode,
            padding_mode,
            message,
            key,
            output_format,
            is_message_hex,
            keySize,
            blockSize,
            kdf_iteration_rounds
        );
    }

    /**
     * @public
     * @desc TripleDES-192 encrypts a message.
     * @param {string|Buffer|Array} message The input message to encrypt.
     * @param {string|Buffer|Array} key The key used with the encryption cipher.
     * @param {string} cipher_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {boolean} to_hex If true, the ciphertext is converted to a hex string, if false, it is
     *      converted to a Base64 string.
     * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {string|Buffer|Array} [one_time_salt] If specified, contains the 64-bit salt used to derive an IV and
     *      Key used to encrypt the message.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {Buffer} Returns a Buffer() object containing the resulting ciphertext.
     * @throws An exception indicating the error that occurred.
     */
    static tripledes192_encrypt(
        message,
        key,
        cipher_mode,
        padding_mode,
        to_hex = false,
        is_message_hex = undefined,
        one_time_salt = undefined,
        kdf_iteration_rounds = 1000
    ) {
        /* Size constants for TripleDES-192. */
        const keySize = 192, blockSize = 64;

        /* Perform the encryption. */
        return discordCrypt.__encrypt(
            'des-ede3',
            cipher_mode,
            padding_mode,
            message,
            key,
            to_hex,
            is_message_hex,
            keySize,
            blockSize,
            one_time_salt,
            kdf_iteration_rounds
        );
    }

    /**
     * @public
     * @desc TripleDES-192 decrypts a message.
     * @param {string|Buffer|Array} message The input message to decrypt.
     * @param {string|Buffer|Array} key The key used with the decryption cipher.
     * @param {string} cipher_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {string} output_format The output format of the decrypted message.
     *      This can be either: [ 'hex', 'base64', 'latin1', 'utf8' ].
     * @param {boolean} [is_message_hex] If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {string|null} Returns a string of the desired format containing the plaintext or null if the chosen
     *      options are invalid.
     * @throws Exception indicating the error that occurred.
     */
    static tripledes192_decrypt(
        message,
        key,
        cipher_mode,
        padding_mode,
        output_format = 'utf8',
        is_message_hex = undefined,
        kdf_iteration_rounds = 1000
    ) {
        /* Size constants for TripleDES-192. */
        const keySize = 192, blockSize = 64;

        /* Return the unpadded message. */
        return discordCrypt.__decrypt(
            'des-ede3',
            cipher_mode,
            padding_mode,
            message,
            key,
            output_format,
            is_message_hex,
            keySize,
            blockSize,
            kdf_iteration_rounds
        );
    }

    /**
     * @public
     * @desc IDEA-128 encrypts a message.
     * @param {string|Buffer|Array} message The input message to encrypt.
     * @param {string|Buffer|Array} key The key used with the encryption cipher.
     * @param {string} cipher_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {boolean} to_hex If true, the ciphertext is converted to a hex string, if false, it is
     *      converted to a Base64 string.
     * @param {boolean} is_message_hex If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {string|Buffer|Array} [one_time_salt] If specified, contains the 64-bit salt used to derive an IV and
     *      Key used to encrypt the message.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {Buffer} Returns a Buffer() object containing the resulting ciphertext.
     * @throws An exception indicating the error that occurred.
     */
    static idea128_encrypt(
        message,
        key,
        cipher_mode,
        padding_mode,
        to_hex = false,
        is_message_hex = undefined,
        one_time_salt = undefined,
        kdf_iteration_rounds = 1000
    ) {
        /* Size constants for IDEA-128. */
        const keySize = 128, blockSize = 64;

        /* Perform the encryption. */
        return discordCrypt.__encrypt(
            'idea',
            cipher_mode,
            padding_mode,
            message,
            key,
            to_hex,
            is_message_hex,
            keySize,
            blockSize,
            one_time_salt,
            kdf_iteration_rounds
        );
    }

    /**
     * @public
     * @desc IDEA-128 decrypts a message.
     * @param {string|Buffer|Array} message The input message to decrypt.
     * @param {string|Buffer|Array} key The key used with the decryption cipher.
     * @param {string} cipher_mode The block operation mode of the cipher.
     *      This can be either [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     * @param {string} output_format The output format of the decrypted message.
     *      This can be either: [ 'hex', 'base64', 'latin1', 'utf8' ].
     * @param {boolean} [is_message_hex] If true, the message is treated as a hex string, if false, it is treated as
     *      a Base64 string. If undefined, the message is treated as a UTF-8 string.
     * @param {int} [kdf_iteration_rounds] The number of rounds used to derive the actual key and IV via sha256.
     * @returns {string|null} Returns a string of the desired format containing the plaintext or null if the chosen
     *      options are invalid.
     * @throws Exception indicating the error that occurred.
     */
    static idea128_decrypt(
        message,
        key,
        cipher_mode,
        padding_mode,
        output_format = 'utf8',
        is_message_hex = undefined,
        kdf_iteration_rounds = 1000
    ) {
        /* Size constants for IDEA-128. */
        const keySize = 128, blockSize = 64;

        /* Return the unpadded message. */
        return discordCrypt.__decrypt(
            'idea',
            cipher_mode,
            padding_mode,
            message,
            key,
            output_format,
            is_message_hex,
            keySize,
            blockSize,
            kdf_iteration_rounds
        );
    }

    /* ============== END CRYPTO CIPHER FUNCTIONS ============== */

    /**
     * @public
     * @desc Converts a cipher string to its appropriate index number.
     * @param {string} primary_cipher The primary cipher.
     *      This can be either [ 'bf', 'aes', 'camel', 'idea', 'tdes' ].
     * @param {string} [secondary_cipher] The secondary cipher.
     *      This can be either [ 'bf', 'aes', 'camel', 'idea', 'tdes' ].
     * @returns {int} Returns the index value of the algorithm.
     */
    static cipherStringToIndex( primary_cipher, secondary_cipher = undefined ) {
        let value = 0;

        /* Return if already a number. */
        if ( typeof primary_cipher === 'number' )
            return primary_cipher;

        /* Check if it's a joined string. */
        if ( typeof primary_cipher === 'string' && primary_cipher.search( '-' ) !== -1 &&
            secondary_cipher === undefined ) {
            primary_cipher = primary_cipher.split( '-' )[ 0 ];
            secondary_cipher = primary_cipher.split( '-' )[ 1 ];
        }

        /* Resolve the primary index. */
        switch ( primary_cipher ) {
            case 'bf':
                /* value = 0; */
                break;
            case 'aes':
                value = 1;
                break;
            case 'camel':
                value = 2;
                break;
            case 'idea':
                value = 3;
                break;
            case 'tdes':
                value = 4;
                break;
            default:
                return 0;
        }

        /* Make sure the secondary is valid. */
        if ( secondary_cipher !== undefined ) {
            switch ( secondary_cipher ) {
                case 'bf':
                    /* value = 0; */
                    break;
                case 'aes':
                    value += 5;
                    break;
                case 'camel':
                    value += 10;
                    break;
                case 'idea':
                    value += 15;
                    break;
                case 'tdes':
                    value += 20;
                    break;
                default:
                    break;
            }
        }

        /* Return the index. */
        return value;
    }

    /**
     * @public
     * @desc Converts an algorithm index to its appropriate string value.
     * @param {int} index The index of the cipher(s) used.
     * @param {boolean} get_secondary Whether to retrieve the secondary algorithm name.
     * @returns {string} Returns a shorthand representation of either the primary or secondary cipher.
     *      This can be either [ 'bf', 'aes', 'camel', 'idea', 'tdes' ].
     */
    static cipherIndexToString( index, get_secondary = undefined ) {

        /* Strip off the secondary. */
        if ( get_secondary !== undefined && get_secondary ) {
            if ( index >= 20 )
                return 'tdes';
            else if ( index >= 15 )
                return 'idea';
            else if ( index >= 10 )
                return 'camel';
            else if ( index >= 5 )
                return 'aes';
            else
                return 'bf';
        }
        /* Remove the secondary. */
        else if ( index >= 20 )
            index -= 20;
        else if ( index >= 15 && index <= 19 )
            index -= 15;
        else if ( index >= 10 && index <= 14 )
            index -= 10;
        else if ( index >= 5 && index <= 9 )
            index -= 5;

        /* Calculate the primary. */
        if ( index === 1 )
            return 'aes';
        else if ( index === 2 )
            return 'camel';
        else if ( index === 3 )
            return 'idea';
        else if ( index === 4 )
            return 'tdes';
        else
            return 'bf';
    }

    /**
     * @public
     * @desc Converts an input string to the approximate entropic bits using Shannon's algorithm.
     * @param {string} key The input key to check.
     * @returns {int} Returns the approximate number of bits of entropy contained in the key.
     */
    static entropicBitLength( key ) {
        let h = Object.create( null ), k;
        let sum = 0, len = key.length;

        key.split( '' ).forEach( c => {
            h[ c ] ? h[ c ]++ : h[ c ] = 1;
        } );

        for ( k in h ) {
            let p = h[ k ] / len;
            sum -= p * Math.log( p ) / Math.log( 2 );
        }

        return parseInt( sum * len );
    }

    /**
     * @desc Returns 256-characters of Braille.
     * @return {string}
     */
    static getBraille() {
        return Array.from(
            "⠀⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿⡀⡁⡂⡃⡄⡅⡆⡇⡈⡉⡊⡋⡌⡍⡎⡏⡐⡑⡒⡓⡔⡕⡖" +
            "⡗⡘⡙⡚⡛⡜⡝⡞⡟⡠⡡⡢⡣⡤⡥⡦⡧⡨⡩⡪⡫⡬⡭⡮⡯⡰⡱⡲⡳⡴⡵⡶⡷⡸⡹⡺⡻⡼⡽⡾⡿⢀⢁⢂⢃⢄⢅⢆⢇⢈⢉⢊⢋⢌⢍⢎⢏⢐⢑⢒⢓⢔⢕⢖⢗⢘⢙⢚⢛⢜⢝⢞⢟⢠⢡⢢⢣⢤⢥⢦⢧⢨⢩⢪⢫⢬⢭" +
            "⢮⢯⢰⢱⢲⢳⢴⢵⢶⢷⢸⢹⢺⢻⢼⢽⢾⢿⣀⣁⣂⣃⣄⣅⣆⣇⣈⣉⣊⣋⣌⣍⣎⣏⣐⣑⣒⣓⣔⣕⣖⣗⣘⣙⣚⣛⣜⣝⣞⣟⣠⣡⣢⣣⣤⣥⣦⣧⣨⣩⣪⣫⣬⣭⣮⣯⣰⣱⣲⣳⣴⣵⣶⣷⣸⣹⣺⣻⣼⣽⣾⣿"
        );
    }

    /**
     * @public
     * @desc Determines if a string has all valid Braille characters according to the result from getBraille()
     * @param {string} message The message to validate.
     * @returns {boolean} Returns true if the message contains only the required character set.
     */
    static isValidBraille( message ) {
        let c = discordCrypt.getBraille();

        for ( let i = 0; i < message.length; i++ )
            if ( c.indexOf( message[ i ] ) === -1 )
                return false;

        return true;
    }

    /**
     * @public
     * @desc Retrieves Base64 charset as an Array Object.
     * @returns {Array} Returns an array of all 64 characters used in Base64 + encoding characters.
     */
    static getBase64() {
        return Array.from( "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" );
    }

    /**
     * @public
     * @desc Returns an array of valid Diffie-Hellman exchange key bit-sizes.
     * @returns {number[]} Returns the bit lengths of all supported DH keys.
     */
    static getDHBitSizes() {
        return [ 768, 1024, 1536, 2048, 3072, 4096, 6144, 8192 ];
    }

    /**
     * @public
     * @desc Returns an array of Elliptic-Curve Diffie-Hellman key bit-sizes.
     * @returns {number[]} Returns the bit lengths of all supported ECDH keys.
     */
    static getECDHBitSizes() {
        return [ 224, 256, 384, 409, 521, 571 ];
    }

    /**
     * @public
     * @desc Determines if a key exchange algorithm's index is valid.
     * @param {int} index The index to determine if valid.
     * @returns {boolean} Returns true if the desired index meets one of the ECDH or DH key sizes.
     */
    static isValidExchangeAlgorithm( index ) {
        return index >= 0 &&
            index <= ( discordCrypt.getDHBitSizes().length + discordCrypt.getECDHBitSizes().length - 1 );
    }

    /**
     * @public
     * @desc Converts an algorithm index to a string.
     * @param {int} index The input index of the exchange algorithm.
     * @returns {string} Returns a string containing the algorithm or "Invalid Algorithm".
     */
    static indexToExchangeAlgorithmString( index ) {
        let dh_bl = discordCrypt.getDHBitSizes(), ecdh_bl = discordCrypt.getECDHBitSizes();
        let base = [ 'DH-', 'ECDH-' ];

        if ( !discordCrypt.isValidExchangeAlgorithm( index ) )
            return 'Invalid Algorithm';

        return ( index <= ( dh_bl.length - 1 ) ?
            base[ 0 ] + dh_bl[ index ] :
            base[ 1 ] + ecdh_bl[ index - dh_bl.length ] );
    }

    /**
     * @public
     * @desc Converts an algorithm index to a bit size.
     * @param {int} index The index to convert to the bit length.
     * @returns {int} Returns 0 if the index is invalid or the bit length of the index.
     */
    static indexToAlgorithmBitLength( index ) {
        let dh_bl = discordCrypt.getDHBitSizes(), ecdh_bl = discordCrypt.getECDHBitSizes();

        if ( !discordCrypt.isValidExchangeAlgorithm( index ) )
            return 0;

        return ( index <= ( dh_bl.length - 1 ) ? dh_bl[ index ] : ecdh_bl[ index - dh_bl.length ] );
    }

    /**
     * @public
     * @desc Computes a secret key from two ECDH or DH keys. One private and one public.
     * @param {Object} private_key A private key DH or ECDH object from NodeJS's crypto module.
     * @param {string} public_key The public key as a string in Base64 or hex format.
     * @param {boolean} is_base_64 Whether the public key is a Base64 string. If false, it is assumed to be hex.
     * @param {boolean} to_base_64 Whether to convert the output secret to Base64.
     *      If false, it is converted to hex.
     * @returns {string|null} Returns a string encoded secret on success or null on failure.
     */
    static computeExchangeSharedSecret( private_key, public_key, is_base_64, to_base_64 ) {
        let in_form, out_form;

        /* Compute the formats. */
        in_form = is_base_64 ? 'base64' : 'hex';
        out_form = to_base_64 ? 'base64' : 'hex';

        /* Compute the derived key and return. */
        try {
            return private_key.computeSecret( public_key, in_form, out_form );
        }
        catch ( e ) {
            return null;
        }
    }

    /**
     * @public
     * @desc Generates a Diffie-Hellman key pair.
     * @param {int} size The bit length of the desired key pair.
     *      This must be one of the supported lengths retrieved from getDHBitSizes().
     * @param {Buffer} private_key The optional private key used to initialize the object.
     * @returns {Object|null} Returns a DiffieHellman object on success or null on failure.
     */
    static generateDH( size, private_key = undefined ) {
        let groupName, key;

        /* Calculate the appropriate group. */
        switch ( size ) {
            case 768:
                groupName = 'modp1';
                break;
            case 1024:
                groupName = 'modp2';
                break;
            case 1536:
                groupName = 'modp5';
                break;
            case 2048:
                groupName = 'modp14';
                break;
            case 3072:
                groupName = 'modp15';
                break;
            case 4096:
                groupName = 'modp16';
                break;
            case 6144:
                groupName = 'modp17';
                break;
            case 8192:
                groupName = 'modp18';
                break;
            default:
                return null;
        }

        /* Create the key object. */
        try {
            key = require( 'crypto' ).getDiffieHellman( groupName );
        }
        catch ( err ) {
            return null;
        }

        /* Generate the key if it's valid. */
        if ( key !== undefined && key !== null && typeof key.generateKeys !== 'undefined' ) {
            if ( private_key === undefined )
                key.generateKeys();
            else if ( typeof key.setPrivateKey !== 'undefined' )
                key.setPrivateKey( private_key );
        }

        /* Return the result. */
        return key;
    }

    /**
     * @public
     * @see http://www.secg.org/sec2-v2.pdf
     * @desc Generates a Elliptic-Curve Diffie-Hellman key pair.
     * @param {int} size The bit length of the desired key pair.
     *      This must be one of the supported lengths retrieved from getECDHBitSizes().
     * @param {Buffer} private_key The optional private key used to initialize the object.
     * @returns {Object|null} Returns a ECDH object on success or null on failure.
     */
    static generateECDH( size, private_key = undefined ) {
        let groupName, key;

        /* Calculate the appropriate group. */
        switch ( size ) {
            case 224:
                groupName = 'secp224k1';
                break;
            case 384:
                groupName = 'secp384r1';
                break;
            case 409:
                groupName = 'sect409k1';
                break;
            case 521:
                groupName = 'secp521r1';
                break;
            case 571:
                groupName = 'sect571k1';
                break;
            case 256:
                break;
            default:
                return null;
        }

        /* Create the key object. */
        try {
            if ( size !== 256 )
                key = require( 'crypto' ).createECDH( groupName );
            else {
                key = new global.Curve25519();
                key.generateKeys( undefined, require( 'crypto' ).randomBytes( 32 ) );
            }
        }
        catch ( err ) {
            return null;
        }

        /* Generate the key if it's valid. */
        if ( key !== undefined && key !== null && typeof key.generateKeys !== 'undefined' && size !== 256 ) {
            /* Generate a new key if the private key is undefined else set the private key. */
            if ( private_key === undefined )
                key.generateKeys( 'hex', 'compressed' );
            else if ( typeof key.setPrivateKey !== 'undefined' )
                key.setPrivateKey( private_key );
        }

        /* Return the result. */
        return key;
    }

    /**
     * @public
     * @desc Substitutes an input Buffer() object to the Braille equivalent from getBraille().
     * @param {string} message The input message to perform substitution on.
     * @param {boolean} convert Whether the message is to be converted from hex to Braille or from Braille to hex.
     * @returns {string} Returns the substituted string encoded message.
     * @throws An exception indicating the message contains characters not in the character set.
     */
    static substituteMessage( message, convert ) {
        /* Target character set. */
        let subset = discordCrypt.getBraille();

        let result = "", index = 0;

        if ( convert !== undefined ) {
            /* Sanity check. */
            if ( !Buffer.isBuffer( message ) )
                throw 'Message input is not a buffer.';

            /* Calculate the target character. */
            for ( let i = 0; i < message.length; i++ )
                result += subset[ message[ i ] ];
        }
        else {
            /* Calculate the target character. */
            for ( let i = 0; i < message.length; i++ ) {
                index = subset.indexOf( message[ i ] );

                /* Sanity check. */
                if ( index === -1 )
                    throw 'Message contains invalid characters.';

                result += `0${index.toString( 16 )}`.slice( -2 );
            }
        }

        return result;
    }

    /**
     * @public
     * @desc Encodes the given values as a braille encoded 32-bit word.
     * @param {int} cipher_index The index of the cipher(s) used to encrypt the message
     * @param {int} cipher_mode_index The index of the cipher block mode used for the message.
     * @param {int} padding_scheme_index The index of the padding scheme for the message.
     * @param {int} pad_byte The padding byte to use.
     * @returns {string} Returns a substituted UTF-16 string of a braille encoded 32-bit word containing these options.
     */
    static metaDataEncode( cipher_index, cipher_mode_index, padding_scheme_index, pad_byte ) {

        /* Parse the first 8 bits. */
        if ( typeof cipher_index === 'string' )
            cipher_index = discordCrypt.cipherStringToIndex( cipher_index );

        /* Parse the next 8 bits. */
        if ( typeof cipher_mode_index === 'string' )
            cipher_mode_index = [ 'cbc', 'cfb', 'ofb' ].indexOf( cipher_mode_index.toLowerCase() );

        /* Parse the next 8 bits. */
        if ( typeof padding_scheme_index === 'string' )
            padding_scheme_index = [ 'pkc7', 'ans2', 'iso1', 'iso9' ].indexOf( padding_scheme_index.toLowerCase() );

        /* Buffered word. */
        let buf = Buffer.from( [ cipher_index, cipher_mode_index, padding_scheme_index, parseInt( pad_byte ) ] );

        /* Convert it and return. */
        return discordCrypt.substituteMessage( buf, true );
    }

    /**
     * @public
     * @desc Decodes an input string and returns a byte array containing index number of options.
     * @param {string} message The substituted UTF-16 encoded metadata containing the metadata options.
     * @returns {int[]} Returns 4 integer indexes of each metadata value.
     */
    static metaDataDecode( message ) {
        /* Decode the result and convert the hex to a Buffer. */
        return Buffer.from( discordCrypt.substituteMessage( message ), 'hex' );
    }

    /**
     * @public
     * @desc Dual-encrypts a message using symmetric keys and returns the substituted encoded equivalent.
     * @param {string|Buffer} message The input message to encrypt.
     * @param {Buffer} primary_key The primary key used for the first level of encryption.
     * @param {Buffer} secondary_key The secondary key used for the second level of encryption.
     * @param {int} cipher_index The cipher index containing the primary and secondary ciphers used for encryption.
     * @param {string} block_mode The block operation mode of the ciphers.
     *      These can be: [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to pad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     *      This prepends a 64 bit seed used to derive encryption keys from the initial key.
     * @returns {string|null} Returns the encrypted and substituted ciphertext of the message or null on failure.
     * @throws An exception indicating the error that occurred.
     */
    static symmetricEncrypt( message, primary_key, secondary_key, cipher_index, block_mode, padding_mode ) {
        const customizationParameter = new Uint8Array( Buffer.from( 'DiscordCrypt MAC' ) );

        /* Performs one of the 5 standard encryption algorithms on the plain text. */
        function handleEncodeSegment( message, key, cipher, mode, pad ) {
            switch ( cipher ) {
                case 0:
                    return discordCrypt.blowfish512_encrypt( message, key, mode, pad );
                case 1:
                    return discordCrypt.aes256_encrypt( message, key, mode, pad );
                case 2:
                    return discordCrypt.camellia256_encrypt( message, key, mode, pad );
                case 3:
                    return discordCrypt.idea128_encrypt( message, key, mode, pad );
                case 4:
                    return discordCrypt.tripledes192_encrypt( message, key, mode, pad );
                default:
                    return null;
            }
        }

        /* Convert the block mode. */
        let mode = block_mode.toLowerCase();

        /* Convert the padding. */
        let pad = padding_mode;

        /* Encode using the user-specified symmetric algorithm. */
        let msg = '';

        /* Dual-encrypt the segment. */
        if ( cipher_index >= 0 && cipher_index <= 4 )
            msg = discordCrypt.blowfish512_encrypt(
                handleEncodeSegment( message, primary_key, cipher_index, mode, pad ),
                secondary_key,
                mode,
                pad,
                true,
                false
            );
        else if ( cipher_index >= 5 && cipher_index <= 9 )
            msg = discordCrypt.aes256_encrypt(
                handleEncodeSegment( message, primary_key, cipher_index - 5, mode, pad ),
                secondary_key,
                mode,
                pad,
                true,
                false
            );
        else if ( cipher_index >= 10 && cipher_index <= 14 )
            msg = discordCrypt.camellia256_encrypt(
                handleEncodeSegment( message, primary_key, cipher_index - 10, mode, pad ),
                secondary_key,
                mode,
                pad,
                true,
                false
            );
        else if ( cipher_index >= 15 && cipher_index <= 19 )
            msg = discordCrypt.idea128_encrypt(
                handleEncodeSegment( message, primary_key, cipher_index - 15, mode, pad ),
                secondary_key,
                mode,
                pad,
                true,
                false
            );
        else if ( cipher_index >= 20 && cipher_index <= 24 )
            msg = discordCrypt.tripledes192_encrypt(
                handleEncodeSegment( message, primary_key, cipher_index - 20, mode, pad ),
                secondary_key,
                mode,
                pad,
                true,
                false
            );
        else
            throw `Unknown cipher selected: ${cipher_index}`;

        /* Get MAC tag as a hex string. */
        let tag = kmac256(
            new Uint8Array( Buffer.concat( [ primary_key, secondary_key ] ) ),
            new Uint8Array( Buffer.from( msg, 'hex' ) ),
            256,
            customizationParameter
        );

        /* Prepend the authentication tag hex string & convert it to Base64. */
        msg = Buffer.from( tag + msg, 'hex' );

        /* Return the message. */
        return discordCrypt.substituteMessage( msg, true );
    }

    /**
     * @public
     * @desc Dual-decrypts a message using symmetric keys and returns the substituted encoded equivalent.
     * @param {string|Buffer|Array} message The substituted and encoded input message to decrypt.
     * @param {Buffer} primary_key The primary key used for the **second** level of decryption.
     * @param {Buffer} secondary_key The secondary key used for the **first** level of decryption.
     * @param {int} cipher_index The cipher index containing the primary and secondary ciphers used for decryption.
     * @param {string} block_mode The block operation mode of the ciphers.
     *      These can be: [ 'CBC', 'CFB', 'OFB' ].
     * @param {string} padding_mode The padding scheme used to unpad the message to the block length of the cipher.
     *      This can be either [ 'ANS1', 'PKC7', 'ISO1', 'ISO9' ].
     *      If this is enabled and authentication fails, null is returned.
     *      This prepends a 64 bit seed used to derive encryption keys from the initial key.
     * @returns {string|null} Returns the encrypted and substituted ciphertext of the message or null on failure.
     * @throws An exception indicating the error that occurred.
     */
    static symmetricDecrypt( message, primary_key, secondary_key, cipher_index, block_mode, padding_mode ) {
        const customizationParameter = new Uint8Array( Buffer.from( 'DiscordCrypt MAC' ) );
        const crypto = require( 'crypto' );

        /* Performs one of the 5 standard decryption algorithms on the plain text. */
        function handleDecodeSegment(
            message,
            key,
            cipher,
            mode,
            pad,
            output_format = 'utf8',
            is_message_hex = undefined
        ) {
            switch ( cipher ) {
                case 0:
                    return discordCrypt.blowfish512_decrypt( message, key, mode, pad, output_format, is_message_hex );
                case 1:
                    return discordCrypt.aes256_decrypt( message, key, mode, pad, output_format, is_message_hex );
                case 2:
                    return discordCrypt.camellia256_decrypt( message, key, mode, pad, output_format, is_message_hex );
                case 3:
                    return discordCrypt.idea128_decrypt( message, key, mode, pad, output_format, is_message_hex );
                case 4:
                    return discordCrypt.tripledes192_decrypt( message, key, mode, pad, output_format, is_message_hex );
                default:
                    return null;
            }
        }

        let mode, pad;

        /* Convert the block mode. */
        if ( typeof block_mode !== 'string' ) {
            if ( block_mode === 0 )
                mode = 'cbc';
            else if ( block_mode === 1 )
                mode = 'cfb';
            else if ( block_mode === 2 )
                mode = 'ofb';
            else return '';
        }

        /* Convert the padding. */
        if ( typeof padding_mode !== 'string' ) {
            if ( padding_mode === 0 )
                pad = 'pkc7';
            else if ( padding_mode === 1 )
                pad = 'ans2';
            else if ( padding_mode === 2 )
                pad = 'iso1';
            else if ( padding_mode === 3 )
                pad = 'iso9';
            else return '';
        }

        try {
            /* Decode level-1 message to a buffer. */
            message = Buffer.from( discordCrypt.substituteMessage( message ), 'hex' );

            /* Pull off the first 32 bytes as a buffer. */
            let tag = Buffer.from( message.subarray( 0, 32 ) );

            /* Strip off the authentication tag. */
            message = Buffer.from( message.subarray( 32 ) );

            /* Compute the HMAC-SHA3-256 of the cipher text as hex. */
            let computed_tag = Buffer.from(
                kmac256(
                    new Uint8Array( Buffer.concat( [ primary_key, secondary_key ] ) ),
                    new Uint8Array( message ),
                    256,
                    customizationParameter
                ),
                'hex'
            );

            /* Compare the tag for validity. */
            if ( !crypto.timingSafeEqual( computed_tag, tag ) )
                return 1;

            /* Dual decrypt the segment. */
            if ( cipher_index >= 0 && cipher_index <= 4 )
                return handleDecodeSegment(
                    discordCrypt.blowfish512_decrypt( message, secondary_key, mode, pad, 'base64' ),
                    primary_key,
                    cipher_index,
                    mode,
                    pad,
                    'utf8',
                    false
                );
            else if ( cipher_index >= 5 && cipher_index <= 9 )
                return handleDecodeSegment(
                    discordCrypt.aes256_decrypt( message, secondary_key, mode, pad, 'base64' ),
                    primary_key,
                    cipher_index - 5,
                    mode,
                    pad,
                    'utf8',
                    false
                );
            else if ( cipher_index >= 10 && cipher_index <= 14 )
                return handleDecodeSegment(
                    discordCrypt.camellia256_decrypt( message, secondary_key, mode, pad, 'base64' ),
                    primary_key,
                    cipher_index - 10,
                    mode,
                    pad,
                    'utf8',
                    false
                );
            else if ( cipher_index >= 15 && cipher_index <= 19 )
                return handleDecodeSegment(
                    discordCrypt.idea128_decrypt( message, secondary_key, mode, pad, 'base64' ),
                    primary_key,
                    cipher_index - 15,
                    mode,
                    pad,
                    'utf8',
                    false
                );
            else if ( cipher_index >= 20 && cipher_index <= 24 )
                return handleDecodeSegment(
                    discordCrypt.tripledes192_decrypt( message, secondary_key, mode, pad, 'base64' ),
                    primary_key,
                    cipher_index - 20,
                    mode,
                    pad,
                    'utf8',
                    false
                );
            return -3;
        }
        catch ( e ) {
            return 2;
        }
    }

    /* ================ END CRYPTO CALLBACKS =================== */
}

/* Required for code coverage reports. */
module.exports = { discordCrypt };
