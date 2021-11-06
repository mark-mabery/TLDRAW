import * as vscode from 'vscode'
import { getHtmlForWebview } from './get-html'
import { EXTENSION_EVENT, UI_EVENT } from './types'

/**
 * The Tldraw extension's editor uses CustomTextEditorProvider, which means
 * it's underlying model from VS Code's perspective is a text file. We likely
 * will switch to CustomEditorProvider which gives us more control but will require
 * more book keeping on our part.
 */
export class TldrawEditorProvider implements vscode.CustomTextEditorProvider {
  private document?: vscode.TextDocument

  // When the tldraw.tldr.new command is triggered, we need to provide a file
  // name when generating a new .tldr file. newTldrawFileId's current value is
  // added to the end of the file to make it unique, and then incremented.
  //
  // While there is probably a more thoughtful way of creating suggested file names,
  // this name is only the temporary name for the new file. The file is still only in memory
  // and hasn't been saved to an actual underlying file. If we suggest a name that turns
  // out to already exist, VS Code will prevent it from being used in it's save dialogs.
  private static newTldrawFileId = 1

  // This is called one time by the main extension entry point. See 'extension.ts'.
  // We register commands here and register our custom editor's provider telling VS Code
  // that we can handle viewing/editing files with the .tldr extension.
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    // This makes a new command show up in the Command Palette that will
    // create a new empty .tldr. The file will actually start out
    // as an empty text file, which is fine as the editor treats
    // blank text files as an empty Tldraw file. Once any change is made
    // and the file saved it will be in a proper JSON format.
    //
    // The command shows up as: "Tldraw: Create a new .tldr file".
    vscode.commands.registerCommand('tldraw.tldr.new', () => {
      // This was included in the example CustomTextEditorProvider. It
      // doesn't seem like we should need a workspace to be within to edit
      // .tldr files, but I want to punt on digging into this.
      // TODO: Test/decide if it is necessary to need a workspace.
      // I can't think of why we'd want a concept of a global scope
      // for editing .tldr files.
      const workspaceFolders = vscode.workspace.workspaceFolders
      if (!workspaceFolders) {
        vscode.window.showErrorMessage(
          'Creating new Tldraw Editor files currently requires opening a workspace'
        )
        return
      }

      // Create a placeholder name for the new file. A new file isn't actually
      // created on disk yet, so this is just an in memory temporary name.
      const uri = vscode.Uri.joinPath(
        workspaceFolders[0].uri,
        `drawing ${TldrawEditorProvider.newTldrawFileId++}.tldr`
      ).with({
        scheme: 'untitled',
      })

      // This triggers VS Code to open our custom editor to edit the file.
      // Note: Multiple editors can register to support certain files, so
      // .tldr files might not by default open to our editor. In this case
      // we are explicitly saying to launch our editor so we're streamlined. It
      // may awkwardly ask if they want to use our editor or a text editor when
      // first using our extension.
      vscode.commands.executeCommand('vscode.openWith', uri, TldrawEditorProvider.viewType)
    })

    // This registers our editor provider, indicating to VS Code that we can
    // handle files with the .tldr extension.
    const provider = new TldrawEditorProvider(context)

    const providerRegistration = vscode.window.registerCustomEditorProvider(
      TldrawEditorProvider.viewType,
      provider,
      {
        webviewOptions: {
          // This is not optimal to set as true, but simplifies our intial implementation.
          // If not set, VS Code will kill our editor instance whenever someone navigates to another
          // file and it's hidden in it's own tab. VS Code requires you to implement some hooks
          // to serialize/hydrate your editor state, but it's going to take probably some serious
          // investigation to get the tldraw/tldraw components APIs ready to enable this. Talk to Francois for
          // more details on this thinking.
          retainContextWhenHidden: true,
        },

        // I'm not sure about the exact semantics about this one. I'm going to leave it in though as
        // it sounds right for our needs. I think this ensures we get a unique instance of our provider
        // per Tldraw editor tab, vs it being shared. It would be really cool if we could support
        // multiple tabs sharing the same document state, but separate editor state (like zoom/pan/selection),
        // but this will likely be a lot of work.
        //
        // The work to support this is likely very related to the  comments above about the
        // 'retainContextWhenHidden' flag as well as multiplayer support. Once we have more thought out
        // support for distinguishing between the state that will be serialized and per-user/per-editor state
        // this may become cheaper to implement.
        supportsMultipleEditorsPerDocument: false,
      }
    )

    return providerRegistration
  }

  // This is a unique identifier for our custom provider
  private static readonly viewType = 'tldraw.tldr'

  // We do nothing in our constructor for now
  constructor(private readonly context: vscode.ExtensionContext) {}

  /**
   * Called when our custom editor is opened, this is where we need to configure
   * the webview that each editor instance will live in. Webviews are basically iframes
   * but usually have more functionality allowed than browsers without requiring users
   * to approve a lot of security permissions. They can optionally even include the
   * node.js runtime and APIs.
   *
   * Each opened .tldr file will have an assocated call to this.
   *
   * NOTE: I haven't tested what happens when you have two instances of the
   * the same file open (say in two tabs split screened)
   */
  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    // Configure the webview. For now all we do is enable scripts and also
    // provide the initial webview's html content.
    webviewPanel.webview.options = {
      enableScripts: true,
    }

    // See get-html.ts for more details, as the logic is a little more complicated
    // than you think in order to have a good workflow while developing.
    webviewPanel.webview.html = getHtmlForWebview(this.context, webviewPanel.webview, document)

    function updateWebview() {
      webviewPanel.webview.postMessage({
        type: 'load',
        text: document.getText(),
      })
    }

    // I'm going to leave this code in as a reminder of this event, but disable it for now
    //
    // TODO: Revisit this function and think about how we want to respond to changes
    // triggered by something other than the tldraw/tldraw component logic. An example
    // being if the file changed on disk, say from git pull that pulls down a change
    // to a .tldr file you have open in a tab.

    const changeDocumentSubscription = vscode.workspace.onDidSaveTextDocument((e) => {
      webviewPanel.webview.postMessage({
        type: EXTENSION_EVENT.LOCAL_FILE_UPDATED,
        text: document.getText(),
      })
    })

    // Make sure we get rid of the listener when our editor is closed.
    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose()
    })

    // Listen for posted messages asynchronously sent from the extensions webview code.
    // For now there is only an update event, which is triggered when the tldraw/tldraw
    // components document has changed.
    webviewPanel.webview.onDidReceiveMessage((e) => {
      switch (e.type) {
        case UI_EVENT.TLDRAW_UPDATED: {
          // Synchronize the TextDocument  with the tldraw components document state
          this.synchronizeTextDocument(document, JSON.parse(e.text))
          break
        }
      }
    })

    // Send the initial document content to bootstrap the tldraw/tldraw component.
    // Note: webview.postMessage is asynchronous and has the same semantics as
    // when you post messages to an iframe from a parent window, in this case
    // the extension isn't actually an enclosing web page.

    webviewPanel.webview.postMessage({
      type: EXTENSION_EVENT.INITIAL_DOCUMENT,
      text: document.getText(),
    })
  }

  /**
   * This updates the vscode.TextDocument's in memory content to match the
   * the stringified version of the provided json.
   * VS Code will handle detecting if the in memory content and the on disk
   * content are different, and then mark/unmark the tab as saved/unsaved
   */
  private synchronizeTextDocument(document: vscode.TextDocument, json: any) {
    // Just replace the entire document every time for this example extension.
    // A more complete extension should compute minimal edits instead.
    // TODO: Make sure to keep an eye on performance problems, as this may be the
    // cause if the tldraw content is big or has been running for a long time.
    // I'm not sure if VSCode is doing optimizations internally to detect/save
    // patches of changes in the undo/redo buffer.
    const edit = new vscode.WorkspaceEdit()

    edit.replace(
      document.uri,
      new vscode.Range(0, 0, document.lineCount, 0),
      JSON.stringify(json, null, 2)
    )

    return vscode.workspace.applyEdit(edit)
  }
}
