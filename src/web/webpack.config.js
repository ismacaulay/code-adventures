const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

function makeProject(name) {
    const projectDir = path.resolve(__dirname, 'projects', name);

    return {
        entry: {
            bundle: path.resolve(projectDir, 'index.ts'),
        },

        output: {
            path: path.resolve(__dirname, 'public', name),
            filename: '[name].js',
            chunkFilename: '[name].[id].js',
        },

        plugins: [
            new HtmlWebpackPlugin({
                title: name,
                template: path.resolve(projectDir, 'index.html'),
            }),
        ],
    };
}

const PROJECTS = ['hello-three', 'rotation-camera-controls'];

module.exports = (env, argv) => {
    console.log(env);
    console.log(argv);

    const base = {
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        mode: 'development',
    };

    const { project } = env;

    if (project) {
        if (!PROJECTS.includes(project)) {
            throw new Error(`Project: ${project} not in PROJECTS list`);
        }

        return merge(base, makeProject(project));
    }

    return PROJECTS.map((p) => merge(base, makeProject(p)));
};
