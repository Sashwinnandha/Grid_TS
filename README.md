# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).


-----------------------------------------------------------------------------------
Functionalities:

Add typescript to the existing application

Add labels like a1 ... an and b1....bn to rows and columns respectively
when user clicks on the label the row/column should switch to column/row
Store the set configuration locally and load on reload

Enable to user to edit the rows and columns after creation
Do not loss the added block when row/colm conversion or grid updation - Done
need to throw error when empty spaces are less than added blocks - Done
add 1 more item - 3 blocks and it should in a group manner - Done

Errors:

When can't hold new blocks
when grid can't hold active blocks on decrease of row/column
when grid can't hold active blocks on conversion

-------------------------------------------------------------------------------------

Optimization:

Changes done:

1. Split components to have easy readability
2. Maintaining Grid under Refs and removed the states of items, merge the sates of input fields (row, columns)
3. Because of Grid ref, direct finding of missing blocks instead of comparison between current and previous grid.
4. Removed count function and made calculations on existing blocks state.
5. Lazy loading of the Grid component
6. Missing blocks will be added to refs and upon changes it will executed by useEffect.
7. Handle different functions for Create and Update of same input pop up display.
8. AddItem function is invoked by type and number of blocks directly to avoid if statements.
9. Optimized way of adding the blocks into grid for all 4 types (Previously item 4 has different if block)
10. Reduced parsing of data by calling common function when need to set it on local storage
11. useCallback hook is used to re-create the function only when the dependency changes.(handleGridCreate , handleUpdateGrid, findSpaces)
12. Disabled the buttons with the help of existing block ref data instead of having separate items state.
13. Handled headers of row and column to have consecutive +2 numbers using an array and find if any in between numbers are missed
14. To avoid props drilling, useContentAPI hooks has been applied now.



Still improve:
1. Maintain all values of grid, blocks,rowRef,colRef together to have easy way of adding in local storage.
2. Adding the rows/columns in a numeric sorting way
3. Instead of separate way of handling conversion mechanism, still can be optimized
4. Instead of alerting the users, we can use error messages on UI page.
5. All local storages can be handled by creating cutom hooks
6. Update with Redux instead of useContextAPI to avoid props drilling

------------------------------------------------------------------------------------------
